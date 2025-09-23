const Csr = require("../models/Csr");
const { Op } = require("sequelize");
const findByIdOrSlug = require("../helpers/findByIdOrSlug");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");

// Create CSR post Method
const createCsrPost = async (req, res, next) => {
  try {
    const { title, content, date, status } = req.body;
    const slug = await generateUniqueSlug(Csr, title);
    const image = req.file?.filename || null;

    const newPost = await Csr.create({
      title,
      content,
      slug,
      date,
      status,
      image,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/csr",
      resourceId: newPost.id,
      description: `Created CSR post: "${newPost.title}" (ID: ${newPost.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      code: 201,
      success: true,
      message: "CSR post created successfully",
      data: newPost,
    });
  } catch (error) {
    next(error);
  }
};

// Get all CSR post Method
const getAllCsrPosts = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = parseInt(size) || 10;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * limit;

    let whereCondition = {};

    if (search) {
      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    const { count: totalCsr, rows: csrs } = await Csr.findAndCountAll({
      where: whereCondition,
      offset,
      limit,
      order: [["created_at", "DESC"]],
    });

    if (csrs.length === 0) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "No CSR posts found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR posts retrieved successfully",
      data: {
        csrs,
        totalCsr,
        totalPages: Math.ceil(totalCsr / limit),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get CSR post by Slug Method
const getCsrPostbySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const csrPost = await findByIdOrSlug(Csr, slug, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post retrieved successfully",
      data: csrPost,
    });
  } catch (error) {
    next(error);
  }
};

// Get CSR post by ID Method
const getCsrPostbyId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const csrPost = await findByIdOrSlug(Csr, id, {
      include: [
        {
          model: User,
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post retrieved successfully",
      data: csrPost,
    });
  } catch (error) {
    next(error);
  }
};

// Update CSR post Method
const updateCsrPost = async (req, res, next) => {
  try {
    const { title, content, date, status } = req.body;
    const slug = await generateUniqueSlug(Csr, title);

    const csrId = req.params.id;
    const csrPost = await Csr.findByPk(csrId);
    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    if (csrPost.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this post",
      });
    }

    csrPost.title = title;
    csrPost.content = content;
    csrPost.slug = slug;
    csrPost.date = date;
    csrPost.status = status;
    if (req.file) {
      csrPost.image = req.file.filename;
    }

    await csrPost.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/csr",
      resourceId: csrPost.id,
      description: `Updated CSR post: "${csrPost.title}" (ID: ${csrPost.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post updated successfully",
      data: csrPost,
    });
  } catch (error) {
    next(error);
  }
};

// Delete CSR post Method
const deleteCsrPost = async (req, res, next) => {
  try {
    const csrId = req.params.id;
    const csrPost = await Csr.findByPk(csrId);
    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    if (csrPost.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this post",
      });
    }

    await csrPost.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/csr",
      resourceId: csrPost.id,
      description: `Deleted CSR post: "${csrPost.title}" (ID: ${csrPost.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCsrPost,
  getAllCsrPosts,
  getCsrPostbySlug,
  getCsrPostbyId,
  updateCsrPost,
  deleteCsrPost,
};
