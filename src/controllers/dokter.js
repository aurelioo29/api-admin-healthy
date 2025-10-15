const { Op } = require("sequelize");
const Dokter = require("../models/Dokter");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createDokter = async (req, res, next) => {
  try {
    const { name, specialization } = req.body;
    const image = relPathFromFile(req.file);

    const dokter = await Dokter.create({
      name,
      specialization,
      image,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/dokters",
      resourceId: dokter.id,
      description: `Created dokter "${dokter.name}" (ID: ${dokter.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = dokter.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Dokter created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllDokters = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { specialization: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count: totalDoktors, rows } = await Dokter.findAndCountAll({
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

    const dokters = rows.map((dokter) => {
      const json = dokter.toJSON();
      json.imageUrl = toPublicUrl(req, json.image);
      return json;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Dokters retrieved successfully",
      data: {
        dokters,
        totalDoktors,
        totalPages: Math.max(Math.ceil(totalDoktors / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDokterByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const dokter = await Dokter.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!dokter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Dokter not found",
      });
    }

    const json = dokter.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Dokter retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateDokter = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, specialization } = req.body;

    const dokter = await Dokter.findByPk(id);
    if (!dokter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Dokter not found",
      });
    }

    // if (dokter.author_id !== req.user.id) {
    //   return res.status(403).json({
    //     code: 403,
    //     success: false,
    //     message: "Unauthorized: Not authorized to update this dokter",
    //   });
    // }

    if (name) dokter.name = name;
    if (specialization) dokter.specialization = specialization;
    if (req.file) {
      const newRelPath = relPathFromFile(req.file);
      if (dokter.image) {
        tryDeleteUpload(dokter.image);
      }
      dokter.image = newRelPath;
    }
    await dokter.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/dokters",
      resourceId: dokter.id,
      description: `Updated dokter "${dokter.name}" (ID: ${dokter.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = dokter.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Dokter updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDokter = async (req, res, next) => {
  try {
    const { id } = req.params;

    const dokter = await Dokter.findByPk(id);
    if (!dokter) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Dokter not found",
      });
    }

    // if (dokter.author_id !== req.user.id) {
    //   return res.status(403).json({
    //     code: 403,
    //     success: false,
    //     message: "Unauthorized: Not authorized to delete this dokter",
    //   });
    // }

    if (dokter.image) tryDeleteUpload(dokter.image);
    await dokter.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/dokters",
      resourceId: dokter.id,
      description: `Deleted dokter "${dokter.name}" (ID: ${dokter.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Dokter deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDokter,
  getAllDokters,
  getDokterByIdentifier,
  updateDokter,
  deleteDokter,
};
