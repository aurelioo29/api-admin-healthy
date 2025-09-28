const { Op } = require("sequelize");
const LabTest = require("../models/LabTest");
const CategoryLabTest = require("../models/CategoryLabTest");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");

// CREATE
const createLabTest = async (req, res, next) => {
  try {
    const { title, content, date, category_id } = req.body;
    const slug = await generateUniqueSlug(LabTest, title);

    const row = await LabTest.create({
      title,
      slug,
      content,
      date,
      category_id,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/lab-tests",
      resourceId: row.id,
      description: `Created lab test "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Lab test created successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// LIST (search + paging + filter category_id)
const getAllLabTests = async (req, res, next) => {
  try {
    const { search, size, page, category_id } = req.query;

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
    if (category_id && /^\d+$/.test(category_id)) {
      where.category_id = parseInt(category_id, 10);
    }

    const { count: totalLabTests, rows } = await LabTest.findAndCountAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryLabTest,
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

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lab tests retrieved successfully",
      data: {
        labTests: rows,
        totalLabTests,
        totalPages: Math.max(Math.ceil(totalLabTests / limit), 1),
        currentPage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DETAIL by id/slug
const getLabTestByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const row = await LabTest.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryLabTest,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!row) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Lab test not found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lab test retrieved successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateLabTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, date, category_id } = req.body;

    const row = await LabTest.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Lab test not found" });
    }

    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this lab test",
      });
    }

    if (title && title !== row.title) {
      row.slug = await generateUniqueSlug(LabTest, title);
      row.title = title;
    }
    if (content != null) row.content = content;
    if (date) row.date = date;
    if (category_id) row.category_id = category_id;

    await row.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/lab-tests",
      resourceId: row.id,
      description: `Updated lab test "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lab test updated successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteLabTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const row = await LabTest.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Lab test not found" });
    }

    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this lab test",
      });
    }

    await row.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/lab-tests",
      resourceId: row.id,
      description: `Deleted lab test "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lab test deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLabTest,
  getAllLabTests,
  getLabTestByIdentifier,
  updateLabTest,
  deleteLabTest,
};
