const Testimoni = require("../models/Testimoni");
const { Op } = require("sequelize");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createTestimoni = async (req, res, next) => {
  try {
    const { name, age, job, content } = req.body;
    const image = relPathFromFile(req.file);

    const newTestimoni = await Testimoni.create({
      name,
      age,
      job,
      content,
      image,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/testimonis",
      resourceId: newTestimoni.id,
      description: `Created testimoni: "${newTestimoni.name}" (ID: ${newTestimoni.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = newTestimoni.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Testimoni created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTestimonis = async (req, res, next) => {
  try {
    const { search, size, page } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { job: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count: totalTestimonis, rows } = await Testimoni.findAndCountAll({
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

    const testimonis = rows.map((r) => {
      const j = r.toJSON();
      j.imageUrl = toPublicUrl(req, j.image);
      return j;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Testimonis retrieved successfully",
      data: {
        testimonis,
        totalTestimonis,
        totalPages: Math.max(Math.ceil(totalTestimonis / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getTestimoniByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { name: identifier };

    const testimoni = await Testimoni.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!testimoni) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Testimoni not found",
      });
    }

    const json = testimoni.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Testimoni retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateTestimoni = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, age, job, content } = req.body;

    const testimoni = await Testimoni.findByPk(id);
    if (!testimoni) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Testimoni not found",
      });
    }

    if (testimoni.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this testimoni",
      });
    }

    if (name !== undefined) testimoni.name = name;
    if (age !== undefined) testimoni.age = age;
    if (job !== undefined) testimoni.job = job;
    if (content !== undefined) testimoni.content = content;

    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (testimoni.image && testimoni.image !== newRel) {
        tryDeleteUpload(testimoni.image);
      }
      testimoni.image = newRel;
    }

    await testimoni.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/testimonis",
      resourceId: testimoni.id,
      description: `Updated testimoni: "${testimoni.name}" (ID: ${testimoni.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = testimoni.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Testimoni updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTestimoni = async (req, res, next) => {
  try {
    const { id } = req.params;

    const testimoni = await Testimoni.findByPk(id);
    if (!testimoni) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Testimoni not found",
      });
    }

    if (testimoni.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this testimoni",
      });
    }

    if (testimoni.image) tryDeleteUpload(testimoni.image);
    await testimoni.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/testimonis",
      resourceId: testimoni.id,
      description: `Deleted testimoni: "${testimoni.name}" (ID: ${testimoni.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Testimoni deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTestimoni,
  getAllTestimonis,
  getTestimoniByIdentifier,
  updateTestimoni,
  deleteTestimoni,
};
