const CategoryArticle = require("../models/CategoryArticle");
const { Op } = require("sequelize");
const findByIdOrSlug = require("../helpers/findByIdOrSlug");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const User = require("../models/User");

// Create Category Article Method
const createCategoryArticle = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = await generateUniqueSlug(CategoryArticle, name);

    const newCategory = await CategoryArticle.create({
      name,
      slug,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/category-articles",
      resourceId: newCategory.id,
      description: `Created category article: "${newCategory.name}" (ID: ${newCategory.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Category article created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

// Get all Category Articles Method
const getAllCategoryArticles = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = parseInt(size) || 10;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [{ name: { [Op.like]: `%${search}%` } }],
      };
    }

    const { count: totalCategories, rows: category_articles } =
      await CategoryArticle.findAndCountAll({
        where: whereCondition,
        offset,
        limit,
        order: [["created_at", "DESC"]],
        include: [{ model: User, attributes: ["id", "username", "email"] }],
        distinct: true,
        subQuery: false,
      });

    if (category_articles.length === 0) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "No category articles found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category articles retrieved successfully",
      data: {
        category_articles,
        totalCategories,
        totalPages: Math.ceil(totalCategories / limit),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get Category Article by Slug or ID Method
const getCategoryArticleByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier) }
      : { slug: identifier };

    const categoryArticle = await CategoryArticle.findOne({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!categoryArticle) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category article not found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category article retrieved successfully",
      data: categoryArticle,
    });
  } catch (error) {
    next(error);
  }
};

// Update Category Article Method
const updateCategoryArticle = async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = await generateUniqueSlug(CategoryArticle, name);

    const categoryArticleId = req.params.id;
    const categoryArticle = await CategoryArticle.findByPk(categoryArticleId);
    if (!categoryArticle) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category article not found",
      });
    }

    if (categoryArticle.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this category article",
      });
    }

    categoryArticle.name = name;
    categoryArticle.slug = slug;

    await categoryArticle.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/category-articles",
      resourceId: categoryArticle.id,
      description: `Updated category article: "${categoryArticle.name}" (ID: ${categoryArticle.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category article updated successfully",
      data: categoryArticle,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Category Article Method
const deleteCategoryArticle = async (req, res, next) => {
  try {
    const categoryArticleId = req.params.id;
    const categoryArticle = await CategoryArticle.findByPk(categoryArticleId);
    if (!categoryArticle) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category article not found",
      });
    }

    if (categoryArticle.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this category article",
      });
    }

    await categoryArticle.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/category-articles",
      resourceId: categoryArticle.id,
      description: `Deleted category article: "${categoryArticle.name}" (ID: ${categoryArticle.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategoryArticle,
  getAllCategoryArticles,
  getCategoryArticleByIdentifier,
  updateCategoryArticle,
  deleteCategoryArticle,
};
