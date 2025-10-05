const { Op } = require("sequelize");
const AboutUsSertifikat = require("../models/AboutUsSertifikat");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createAboutUsSertifikat = async (req, res, next) => {
  try {
    const { title, date, status } = req.body;
    const image = relPathFromFile(req.file);

    const aboutUsSertifikat = await AboutUsSertifikat.create({
      title,
      date,
      image,
      status: status === "published" ? "published" : "draft",
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/about-us-sertifikat",
      resourceId: aboutUsSertifikat.id,
      description: `Created About Us Sertifikat "${aboutUsSertifikat.title}" (ID: ${aboutUsSertifikat.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = aboutUsSertifikat.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "About Us Sertifikat created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAboutUsSertifikat = async (req, res, next) => {
  try {
    const { search, size, page, status } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
    }

    if (status && ["draft", "published"].includes(status)) {
      where.status = status;
    }

    const { count: totalAboutUsSertifikat, rows } =
      await AboutUsSertifikat.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
        offset,
        distinct: true,
        subQuery: false,
      });

    const aboutUsSertifikat = rows.map((aboutUsSertifikat) => {
      const json = aboutUsSertifikat.toJSON();
      json.imageUrl = toPublicUrl(req, json.image);
      return json;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Sertifikat retrieved successfully",
      data: {
        aboutUsSertifikat,
        totalAboutUsSertifikat,
        totalPages: Math.max(Math.ceil(totalAboutUsSertifikat / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAboutUsSertifikatByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const aboutUsSertifikat = await AboutUsSertifikat.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!aboutUsSertifikat) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Sertifikat not found",
      });
    }

    const json = aboutUsSertifikat.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Sertifikat retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateAboutUsSertifikat = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, date, status } = req.body;

    const aboutUsSertifikat = await AboutUsSertifikat.findByPk(id);
    if (!aboutUsSertifikat) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Sertifikat not found",
      });
    }

    if (aboutUsSertifikat.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message:
          "Unauthorized: Not authorized to update this About Us Sertifikat",
      });
    }

    if (title) aboutUsSertifikat.title = title;
    if (date) aboutUsSertifikat.date = date;
    if (status)
      aboutUsSertifikat.status = status === "published" ? "published" : "draft";

    if (req.file) {
      const newRelPath = relPathFromFile(req.file);
      if (aboutUsSertifikat.image && aboutUsSertifikat.image !== newRelPath) {
        tryDeleteUpload(aboutUsSertifikat.image);
      }
      aboutUsSertifikat.image = newRelPath;
    }
    await aboutUsSertifikat.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/about-us-sertifikat",
      resourceId: aboutUsSertifikat.id,
      description: `Updated About Us Sertifikat "${aboutUsSertifikat.title}" (ID: ${aboutUsSertifikat.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = aboutUsSertifikat.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Sertifikat updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAboutUsSertifikat = async (req, res, next) => {
  try {
    const { id } = req.params;

    const aboutUsSertifikat = await AboutUsSertifikat.findByPk(id);
    if (!aboutUsSertifikat) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Sertifikat not found",
      });
    }

    if (aboutUsSertifikat.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message:
          "Unauthorized: Not authorized to delete this About Us Sertifikat",
      });
    }

    if (aboutUsSertifikat.image) tryDeleteUpload(aboutUsSertifikat.image);
    await aboutUsSertifikat.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/about-us-sertifikat",
      resourceId: aboutUsSertifikat.id,
      description: `Deleted About Us Sertifikat "${aboutUsSertifikat.title}" (ID: ${aboutUsSertifikat.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Sertifikat deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAboutUsSertifikat,
  createAboutUsSertifikat,
  getAboutUsSertifikatByIdentifier,
  updateAboutUsSertifikat,
  deleteAboutUsSertifikat,
};
