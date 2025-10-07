const { Op } = require("sequelize");
const path = require("path");
const Investor = require("../models/Investor");
const CategoryInvestor = require("../models/categoryInvestor");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createInvestor = async (req, res, next) => {
  try {
    const { title, content, date, status, category_id } = req.body;

    const slug = await generateUniqueSlug(Investor, title);
    const file = relPathFromFile(req.file);

    const row = await Investor.create({
      title,
      content,
      slug,
      date,
      status: status === "published" ? "published" : "draft",
      file,
      category_id,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/investors",
      resourceId: row.id,
      description: `Created investor "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = row.toJSON();
    json.fileUrl = toPublicUrl(req, json.file);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Investor created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllInvestors = async (req, res, next) => {
  try {
    const { search, size, page, status, category_id } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status && ["draft", "published"].includes(status)) {
      where.status = status;
    }
    if (category_id && /^\d+$/.test(category_id)) {
      where.category_id = parseInt(category_id, 10);
    }

    const { count: totalInvestors, rows } = await Investor.findAndCountAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryInvestor,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    const investors = rows.map((investor) => {
      const json = investor.toJSON();
      json.fileUrl = toPublicUrl(req, json.file);
      return json;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Investors retrieved successfully",
      data: {
        investors,
        totalInvestors,
        totalPages: Math.max(Math.ceil(totalInvestors / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getInvestorByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const investor = await Investor.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryInvestor,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!investor) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Investor not found",
      });
    }

    const json = investor.toJSON();
    json.fileUrl = toPublicUrl(req, json.file);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Investor retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, date, status, category_id } = req.body;

    const investor = await Investor.findByPk(id);
    if (!investor) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Investor not found",
      });
    }

    if (investor.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "You are not authorized to update this investor",
      });
    }

    if (title && title !== investor.title) {
      investor.slug = await generateUniqueSlug(Investor, title, investor.id);
      investor.title = title;
    }
    if (content) investor.content = content;
    if (date) investor.date = date;
    if (status)
      investor.status = status === "published" ? "published" : "draft";
    if (category_id) investor.category_id = category_id;

    if (req.file) {
      const file = relPathFromFile(req.file);
      if (investor.file && investor.file !== file) {
        tryDeleteUpload(investor.file);
      }
      investor.file = file;
    }

    await investor.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/investors",
      resourceId: investor.id,
      description: `Updated investor "${investor.title}" (ID: ${investor.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = investor.toJSON();
    json.fileUrl = toPublicUrl(req, json.file);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Investor updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const investor = await Investor.findByPk(id);
    if (!investor) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Investor not found",
      });
    }

    if (investor.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this investor",
      });
    }

    if (investor.file) tryDeleteUpload(investor.file);
    await investor.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/investors",
      resourceId: investor.id,
      description: `Deleted investor "${investor.title}" (ID: ${investor.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Investor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const downloadInvestorFile = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const row = await Investor.findOne({
      where: isNumeric ? { id: +identifier } : { slug: identifier },
    });

    if (!row || !row.file) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "File not found" });
    }

    const absPath = path.resolve(
      process.cwd(),
      "uploads",
      row.file.replace(/^(\.\/|\/)/, "")
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${row.slug}.pdf"`
    );
    return res.sendFile(absPath);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvestor,
  getAllInvestors,
  getInvestorByIdentifier,
  updateInvestor,
  deleteInvestor,
  downloadInvestorFile,
};
