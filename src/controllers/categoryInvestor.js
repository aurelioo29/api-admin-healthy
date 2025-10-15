const CategoryInvestor = require("../models/categoryInvestor");
const { Op } = require("sequelize");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const User = require("../models/User");

const createCategoryInvestor = async (req, res, next) => {
  try {
    const { name } = req.body;
    const rawName = (req.body?.name || "").trim();

    const exists = await CategoryInvestor.findOne({
      where: { name: { [Op.like]: rawName } },
    });

    if (exists) {
      return res.status(409).json({
        code: 409,
        success: false,
        message: "Category name already exists",
      });
    }

    const slug = await generateUniqueSlug(CategoryInvestor, name);

    const category = await CategoryInvestor.create({
      name,
      slug,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/category-investors",
      resourceId: category.id,
      description: `Created category investor: "${category.name}" (ID: ${category.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Category investor created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

const getAllCategoryInvestors = async (req, res, next) => {
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

    const { count: totalCategoryInvestors, rows: category_investors } =
      await CategoryInvestor.findAndCountAll({
        where: whereCondition,
        offset,
        limit,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "email"],
          },
        ],
        distinct: true,
        subQuery: false,
      });

    if (category_investors.length === 0) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "No category investors found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category investors retrieved successfully",
      data: {
        category_investors,
        totalCategoryInvestors,
        totalPage: Math.ceil(totalCategoryInvestors / limit),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryInvestorByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier) }
      : { slug: identifier };

    const categoryInvestor = await CategoryInvestor.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!categoryInvestor) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category investor not found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category investor retrieved successfully",
      data: categoryInvestor,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategoryInvestor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const categoryPost = await CategoryInvestor.findByPk(id);
    if (!categoryPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category investor not found",
      });
    }

    // if (categoryPost.author_id !== req.user.id) {
    //   return res.status(403).json({
    //     code: 403,
    //     success: false,
    //     message:
    //       "Unauthorized: Not authorized to update this category investor",
    //   });
    // }

    if (name && name !== categoryPost.name) {
      categoryPost.slug = await generateUniqueSlug(CategoryInvestor, name);
    }

    if (name) categoryPost.name = name;

    await categoryPost.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/category-investors",
      resourceId: categoryPost.id,
      description: `Updated category investor: "${categoryPost.name}" (ID: ${categoryPost.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category investor updated successfully",
      data: categoryPost,
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategoryInvestor = async (req, res, next) => {
  try {
    const categoryInvestorId = req.params.id;
    const categoryInvestor = await CategoryInvestor.findByPk(
      categoryInvestorId
    );

    if (!categoryInvestor) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Category investor not found",
      });
    }

    // if (categoryInvestor.author_id !== req.user.id) {
    //   return res.status(403).json({
    //     code: 403,
    //     success: false,
    //     message:
    //       "Unauthorized: Not authorized to delete this category investor",
    //   });
    // }

    await categoryInvestor.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/category-investors",
      resourceId: categoryInvestor.id,
      description: `Deleted category investor: "${categoryInvestor.name}" (ID: ${categoryInvestor.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Category investor deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategoryInvestor,
  getAllCategoryInvestors,
  getCategoryInvestorByIdentifier,
  updateCategoryInvestor,
  deleteCategoryInvestor,
};
