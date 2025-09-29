const { Op } = require("sequelize");
const CategoryCatalog = require("../models/CategoryCatalog");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const Catalog = require("../models/Catalog");

// CREATE
const createCategoryCatalog = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = await generateUniqueSlug(CategoryCatalog, name);

    const row = await CategoryCatalog.create({
      name,
      slug,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/catalog-categories",
      resourceId: row.id,
      description: `Created catalog category "${row.name}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Category created successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// LIST (search + paging)
const getAllCategoryCatalogs = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;
    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count: totalCategories, rows } =
      await CategoryCatalog.findAndCountAll({
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

    res.status(200).json({
      code: 200,
      success: true,
      message: "Categories retrieved successfully",
      data: {
        categories: rows,
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
const getCategoryCatalogByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);
    const where = isNumeric ? { id: +identifier } : { slug: identifier };

    const row = await CategoryCatalog.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Category not found" });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category retrieved successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// UPDATE
const updateCategoryCatalog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const row = await CategoryCatalog.findByPk(id);
    if (!row)
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Category not found" });

    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not allowed to update this category",
      });
    }

    if (name && name !== row.name) {
      row.slug = await generateUniqueSlug(CategoryCatalog, name);
      row.name = name;
    }
    await row.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/catalog-categories",
      resourceId: row.id,
      description: `Updated catalog category "${row.name}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category updated successfully",
      data: row,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
const deleteCategoryCatalog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const row = await CategoryCatalog.findByPk(id);
    if (!row)
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Category not found" });

    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not allowed to delete this category",
      });
    }

    // const usedCount = await Catalog.count({ where: { category_id: id } });
    // if (usedCount > 0) {
    //   return res.status(400).json({
    //     code: 400,
    //     success: false,
    //     message: "Cannot delete: category is used by existing catalogs",
    //   });
    // }

    await row.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/catalog-categories",
      resourceId: id,
      description: `Deleted catalog category "${row.name}" (ID: ${id})`,
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
  createCategoryCatalog,
  getAllCategoryCatalogs,
  getCategoryCatalogByIdentifier,
  updateCategoryCatalog,
  deleteCategoryCatalog,
};
