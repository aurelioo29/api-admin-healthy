const { Op } = require("sequelize");
const Article = require("../models/Article");
const User = require("../models/User");
const CategoryArticle = require("../models/CategoryArticle");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

// Create
const createArticle = async (req, res, next) => {
  try {
    const { title, content, date, status, category_id } = req.body;
    const slug = await generateUniqueSlug(Article, title);
    const image = relPathFromFile(req.file);

    const article = await Article.create({
      title,
      slug,
      content,
      image,
      date,
      status: status === "published" ? "published" : "draft",
      category_id,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/articles",
      resourceId: article.id,
      description: `Created article "${article.title}" (ID: ${article.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = article.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Article created successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// List
const getAllArticles = async (req, res, next) => {
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

    const { count: totalArticles, rows } = await Article.findAndCountAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryArticle,
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

    // tambahkan imageUrl
    const articles = rows.map((r) => {
      const j = r.toJSON();
      j.imageUrl = toPublicUrl(req, j.image);
      return j;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Articles retrieved successfully",
      data: {
        articles,
        totalArticles,
        totalPages: Math.max(Math.ceil(totalArticles / limit), 1),
        currentPage,
      },
    });
  } catch (err) {
    console.error(
      "getAllArticles error:",
      err?.parent?.sqlMessage || err.message
    );
    next(err);
  }
};

// Get by slug or id
const getArticleByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const article = await Article.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryArticle,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Article not found",
      });
    }

    const json = article.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Article retrieved successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// Update
const updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, date, status, category_id } = req.body;

    const article = await Article.findByPk(id);
    if (!article) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Article not found" });
    }

    if (article.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this article",
      });
    }

    if (title && title !== article.title) {
      article.slug = await generateUniqueSlug(Article, title);
      article.title = title;
    }
    if (content != null) article.content = content;
    if (date) article.date = date;
    if (status) article.status = status === "published" ? "published" : "draft";
    if (category_id) article.category_id = category_id;

    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (article.image && article.image !== newRel) {
        tryDeleteUpload(article.image);
      }
      article.image = newRel;
    }

    await article.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/articles",
      resourceId: article.id,
      description: `Updated article "${article.title}" (ID: ${article.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = article.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Article updated successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

// Delete
const deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Article not found" });
    }

    if (article.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this article",
      });
    }

    if (article.image) tryDeleteUpload(article.image);
    await article.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/articles",
      resourceId: article.id,
      description: `Deleted article "${article.title}" (ID: ${article.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Article deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createArticle,
  getAllArticles,
  getArticleByIdentifier,
  updateArticle,
  deleteArticle,
};
