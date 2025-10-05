const { Op } = require("sequelize");
const EventPromo = require("../models/EventPromo");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createEventPromo = async (req, res, next) => {
  try {
    const { title, date, status } = req.body;
    const image = relPathFromFile(req.file);

    const eventPromo = await EventPromo.create({
      title,
      date,
      image,
      status: status === "published" ? "published" : "draft",
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/event-promos",
      resourceId: eventPromo.id,
      description: `Created event/promo "${eventPromo.title}" (ID: ${eventPromo.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = eventPromo.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Event/Promo created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllEventPromos = async (req, res, next) => {
  try {
    const { search, size, page, status } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
    }

    if (status && ["draft", "published"].includes(status)) {
      where.status = status;
    }

    const { count: totalEventPromos, rows } = await EventPromo.findAndCountAll({
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

    const eventPromos = rows.map((eventPromo) => {
      const json = eventPromo.toJSON();
      json.imageUrl = toPublicUrl(req, json.image);
      return json;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Event/Promos retrieved successfully",
      data: {
        eventPromos,
        totalEventPromos,
        totalPages: Math.max(Math.ceil(totalEventPromos / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getEventPromosByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const eventPromo = await EventPromo.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!eventPromo) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Event/Promo not found",
      });
    }

    const json = eventPromo.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Event/Promo retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateEventPromo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, date, status } = req.body;

    const eventPromo = await EventPromo.findByPk(id);
    if (!eventPromo) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Event/Promo not found",
      });
    }

    if (eventPromo.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this Event/Promo",
      });
    }

    if (title) eventPromo.title = title;
    if (date) eventPromo.date = date;
    if (status)
      eventPromo.status = status === "published" ? "published" : "draft";

    if (req.file) {
      const newRelPath = relPathFromFile(req.file);
      if (eventPromo.image && eventPromo.image !== newRelPath) {
        tryDeleteUpload(eventPromo.image);
      }
      eventPromo.image = newRelPath;
    }
    await eventPromo.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/event-promos",
      resourceId: eventPromo.id,
      description: `Updated event/promo "${eventPromo.title}" (ID: ${eventPromo.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = eventPromo.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Event/Promo updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteEventPromo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const eventPromo = await EventPromo.findByPk(id);
    if (!eventPromo) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Event/Promo not found",
      });
    }

    if (eventPromo.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this Event/Promo",
      });
    }

    if (eventPromo.image) tryDeleteUpload(eventPromo.image);
    await eventPromo.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/event-promos",
      resourceId: eventPromo.id,
      description: `Deleted event/promo "${eventPromo.title}" (ID: ${eventPromo.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Event/Promo deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEventPromos,
  createEventPromo,
  getEventPromosByIdentifier,
  updateEventPromo,
  deleteEventPromo,
};
