const HomeCard = require("../models/homeCard");
const User = require("../models/User");
const { Op } = require("sequelize");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createHomeCard = async (req, res, next) => {
  try {
    const { title, status } = req.body;
    const image = relPathFromFile(req.file);

    const newCard = await HomeCard.create({
      title,
      image,
      status: status === "published" ? "published" : "draft",
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/home-card",
      resourceId: newCard.id,
      description: `Created Home Card: "${newCard.title}" (ID: ${newCard.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = newCard.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Home Card created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllHomeCards = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }

    const { count: totalHomeCards, rows } = await HomeCard.findAndCountAll({
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

    const homeCards = rows.map((r) => {
      const json = r.toJSON();
      return {
        ...json,
        imageUrl: toPublicUrl(req, json.image),
      };
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Home cards retrieved successfully",
      data: {
        homeCards,
        totalHomeCards,
        totalPages: Math.max(Math.ceil(totalHomeCards / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    console.error(
      "getAllHomeCards error:",
      error?.parent?.sqlMessage || error.message
    );
    next(error);
  }
};

const getHomeCardByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const homecard = await HomeCard.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!homecard) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Home Card not found",
      });
    }

    const json = homecard.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Home Card retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateHomeCard = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { title, status } = req.body;

    const card = await HomeCard.findByPk(id);
    if (!card) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Home Card not found",
      });
    }

    if (title) card.title = title;
    if (status) card.status = status === "published" ? "published" : "draft";

    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (card.image && card.image !== newRel) {
        tryDeleteUpload(card.image);
      }
      card.image = newRel;
    }

    await card.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/home-card",
      resourceId: card.id,
      description: `Updated Home Card: "${card.title}" (ID: ${card.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = card.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Home Card updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteHomeCard = async (req, res, next) => {
  try {
    const homeCardId = req.params.id;
    const homeCard = await HomeCard.findByPk(homeCardId);
    if (!homeCard) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Home Card not found",
      });
    }

    const oldImage = homeCard.image;
    await homeCard.destroy();
    tryDeleteUpload(oldImage);

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/home-card",
      resourceId: homeCardId,
      description: `Deleted Home Card ID: ${homeCardId}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Home Card deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHomeCard,
  getAllHomeCards,
  getHomeCardByIdentifier,
  updateHomeCard,
  deleteHomeCard,
};
