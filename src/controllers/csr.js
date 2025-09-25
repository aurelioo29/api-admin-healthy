const Csr = require("../models/Csr");
const { Op } = require("sequelize");
const findByIdOrSlug = require("../helpers/findByIdOrSlug");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");

const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

// Create CSR post Method
const createCsrPost = async (req, res, next) => {
  try {
    const { title, content, date, status } = req.body;

    const slug = await generateUniqueSlug(Csr, title);
    const image = relPathFromFile(req.file); // "csr/filename.ext" atau null

    const newPost = await Csr.create({
      title,
      content,
      slug,
      date,
      status: status === "published" ? "published" : "draft",
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

    const json = newPost.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "CSR post created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

// Get all CSR post Method
const getAllCsrPosts = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

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

    const { count: totalCsr, rows } = await Csr.findAndCountAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    // map imageUrl biar FE tinggal pake
    const csrs = rows.map((r) => {
      const json = r.toJSON();
      return {
        ...json,
        imageUrl: toPublicUrl(req, json.image),
      };
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "CSR posts retrieved successfully",
      data: {
        csrs,
        totalCsr,
        totalPages: Math.max(Math.ceil(totalCsr / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    console.error(
      "getAllCsrPosts error:",
      error?.parent?.sqlMessage || error.message
    );
    next(error);
  }
};

// Get CSR post by Slug Method
const getCsrPostbySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const csrPost = await findByIdOrSlug(Csr, slug, {
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    const json = csrPost.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post retrieved successfully",
      data: json,
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
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!csrPost) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "CSR post not found",
      });
    }

    const json = csrPost.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

// Update CSR post Method
const updateCsrPost = async (req, res, next) => {
  try {
    const { title, content, date, status } = req.body;
    const csrId = req.params.id;

    const csrPost = await Csr.findByPk(csrId);
    if (!csrPost) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "CSR post not found" });
    }

    if (csrPost.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this post",
      });
    }

    // update slug hanya kalau title berubah
    if (title && title !== csrPost.title) {
      csrPost.slug = await generateUniqueSlug(Csr, title);
    }

    if (title) csrPost.title = title;
    if (content) csrPost.content = content;
    if (date) csrPost.date = date;
    if (status) csrPost.status = status === "published" ? "published" : "draft";

    // handle image baru
    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (csrPost.image && csrPost.image !== newRel) {
        tryDeleteUpload(csrPost.image);
      }
      csrPost.image = newRel;
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

    const json = csrPost.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "CSR post updated successfully",
      data: json,
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

    const oldImage = csrPost.image;
    await csrPost.destroy();
    tryDeleteUpload(oldImage);

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/csr",
      resourceId: csrId,
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
