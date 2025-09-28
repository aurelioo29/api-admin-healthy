const { Op } = require("sequelize");
const CategoryLabTest = require("../models/CategoryLabTest");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

// CREATE
const createCategoryLabTest = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = await generateUniqueSlug(CategoryLabTest, name);
    const image = relPathFromFile(req.file);

    const row = await CategoryLabTest.create({
      name,
      slug,
      description,
      image,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/category-lab-tests",
      resourceId: row.id,
      description: `Created category lab test "${row.name}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Category created successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// LIST
const getAllCategoryLabTests = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count: totalCategories, rows } =
      await CategoryLabTest.findAndCountAll({
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

    const categories = rows.map((r) => {
      const j = r.toJSON();
      j.imageUrl = toPublicUrl(req, j.image);
      return j;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories,
        totalCategories,
        totalPages: Math.max(Math.ceil(totalCategories / limit), 1),
        currentPage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DETAIL by id/slug
const getCategoryLabTestByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const row = await CategoryLabTest.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!row) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category not found",
      });
    }

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category retrieved successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateCategoryLabTest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const row = await CategoryLabTest.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Category not found" });
    }

    // Optional: batasi author yang bisa edit
    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not allowed to update this category",
      });
    }

    if (name && name !== row.name) {
      row.slug = await generateUniqueSlug(CategoryLabTest, name);
      row.name = name;
    }
    if (description != null) row.description = description;

    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (row.image && row.image !== newRel) {
        tryDeleteUpload(row.image);
      }
      row.image = newRel;
    }

    await row.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/category-lab-tests",
      resourceId: row.id,
      description: `Updated category lab test "${row.name}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category updated successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteCategoryLabTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const row = await CategoryLabTest.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Category not found" });
    }

    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not allowed to delete this category",
      });
    }

    if (row.image) tryDeleteUpload(row.image);
    await row.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/category-lab-tests",
      resourceId: row.id,
      description: `Deleted category lab test "${row.name}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategoryLabTest,
  getAllCategoryLabTests,
  getCategoryLabTestByIdentifier,
  updateCategoryLabTest,
  deleteCategoryLabTest,
};
