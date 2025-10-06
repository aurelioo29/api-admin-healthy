const { Op } = require("sequelize");
const AboutUsGallery = require("../models/aboutUs_gallery");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createAboutUsGallery = async (req, res, next) => {
  try {
    const { title, date, status } = req.body;
    const image = relPathFromFile(req.file);

    const aboutUsGallery = await AboutUsGallery.create({
      title,
      date,
      image,
      status: status === "published" ? "published" : "draft",
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/about-us-gallery",
      resourceId: aboutUsGallery.id,
      description: `Created About Us Gallery "${aboutUsGallery.title}" (ID: ${aboutUsGallery.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = aboutUsGallery.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "About Us Gallery created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllAboutUsGallery = async (req, res, next) => {
  try {
    const { search, size, page, status } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }

    if (status && ["draft", "published"].includes(status)) {
      where.status = status;
    }

    const { count: totalAboutUsGallery, rows } =
      await AboutUsGallery.findAndCountAll({
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

    const aboutUsGallery = rows.map((aboutUsGallery) => {
      const json = aboutUsGallery.toJSON();
      json.imageUrl = toPublicUrl(req, json.image);
      return json;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Gallery retrieved successfully",
      data: {
        aboutUsGallery,
        totalAboutUsGallery,
        totalPages: Math.max(Math.ceil(totalAboutUsGallery / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAboutUsGalleryByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const aboutUsGallery = await AboutUsGallery.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!aboutUsGallery) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Gallery not found",
      });
    }

    const json = aboutUsGallery.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Gallery retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateAboutUsGallery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, date, status } = req.body;

    const aboutUsGallery = await AboutUsGallery.findByPk(id);
    if (!aboutUsGallery) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Gallery not found",
      });
    }

    if (aboutUsGallery.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this About Us Gallery",
      });
    }

    if (title) aboutUsGallery.title = title;
    if (date) aboutUsGallery.date = date;
    if (status)
      aboutUsGallery.status = status === "published" ? "published" : "draft";

    if (req.file) {
      const newRelPath = relPathFromFile(req.file);
      if (aboutUsGallery.image && aboutUsGallery.image !== newRelPath) {
        tryDeleteUpload(aboutUsGallery.image);
      }
      aboutUsGallery.image = newRelPath;
    }
    await aboutUsGallery.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/about-us-gallery",
      resourceId: aboutUsGallery.id,
      description: `Updated About Us Gallery "${aboutUsGallery.title}" (ID: ${aboutUsGallery.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = aboutUsGallery.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Gallery updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAboutUsGallery = async (req, res, next) => {
  try {
    const { id } = req.params;

    const aboutUsGallery = await AboutUsGallery.findByPk(id);
    if (!aboutUsGallery) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "About Us Gallery not found",
      });
    }

    if (aboutUsGallery.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this About Us Gallery",
      });
    }

    if (aboutUsGallery.image) tryDeleteUpload(aboutUsGallery.image);
    await aboutUsGallery.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/about-us-gallery",
      resourceId: aboutUsGallery.id,
      description: `Deleted About Us Gallery "${aboutUsGallery.title}" (ID: ${aboutUsGallery.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "About Us Gallery deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAboutUsGallery,
  createAboutUsGallery,
  getAboutUsGalleryByIdentifier,
  updateAboutUsGallery,
  deleteAboutUsGallery,
};
