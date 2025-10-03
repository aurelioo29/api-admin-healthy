const LokasiKlinik = require("../models/lokasiKlinik");
const { Op } = require("sequelize");
const User = require("../models/User");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createLokasiKlinik = async (req, res, next) => {
  try {
    const {
      title,
      address,
      phone,
      operational,
      type_service,
      link_map,
      wa_number,
      jenis,
    } = req.body;
    const slug = await generateUniqueSlug(LokasiKlinik, title);
    const image = relPathFromFile(req.file);

    const newLokasiKlinik = await LokasiKlinik.create({
      title,
      slug,
      image,
      address,
      phone,
      operational,
      type_service,
      link_map,
      wa_number,
      jenis,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/lokasi-klinik",
      resourceId: newLokasiKlinik.id,
      description: `Created lokasi klinik: "${newLokasiKlinik.title}" (ID: ${newLokasiKlinik.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = newLokasiKlinik.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Lokasi Klinik created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllLokasiKlinik = async (req, res, next) => {
  try {
    const { search, size, page, jenis } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }

    if (jenis && LokasiKlinik.JENIS.includes(jenis)) {
      where.jenis = jenis;
    }

    const { count: totalLokasiKlinik, rows } =
      await LokasiKlinik.findAndCountAll({
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

    const lokasiKliniks = rows.map((r) => {
      const j = r.toJSON();
      j.imageUrl = toPublicUrl(req, j.image);
      return j;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lokasi Klinik retrieved successfully",
      data: {
        lokasiKliniks,
        totalLokasiKlinik,
        totalPages: Math.max(Math.ceil(totalLokasiKlinik / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getLokasiKlinikByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const lokasiKlinik = await LokasiKlinik.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!lokasiKlinik) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Lokasi Klinik not found",
      });
    }

    const json = lokasiKlinik.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lokasi Klinik retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateLokasiKlinik = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      address,
      phone,
      operational,
      type_service,
      link_map,
      wa_number,
      jenis,
    } = req.body;

    const lokasiKlinik = await LokasiKlinik.findByPk(id);
    if (!lokasiKlinik) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Lokasi Klinik not found",
      });
    }

    if (lokasiKlinik.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to update this Lokasi Klinik",
      });
    }

    if (title && title !== lokasiKlinik.title) {
      lokasiKlinik.slug = await generateUniqueSlug(LokasiKlinik, title);
      lokasiKlinik.title = title;
    }
    if (address !== undefined) lokasiKlinik.address = address;
    if (phone !== undefined) lokasiKlinik.phone = phone;
    if (operational !== undefined) lokasiKlinik.operational = operational;
    if (type_service !== undefined) lokasiKlinik.type_service = type_service;
    if (link_map !== undefined) lokasiKlinik.link_map = link_map;
    if (wa_number !== undefined) lokasiKlinik.wa_number = wa_number;
    if (jenis && LokasiKlinik.JENIS.includes(jenis)) lokasiKlinik.jenis = jenis;

    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (lokasiKlinik.image && lokasiKlinik.image !== newRel) {
        tryDeleteUpload(lokasiKlinik.image);
      }
      lokasiKlinik.image = newRel;
    }

    await lokasiKlinik.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/lokasi-klinik",
      resourceId: lokasiKlinik.id,
      description: `Updated lokasi klinik: "${lokasiKlinik.title}" (ID: ${lokasiKlinik.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    const json = lokasiKlinik.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lokasi Klinik updated successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLokasiKlinik = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lokasiKlinik = await LokasiKlinik.findByPk(id);
    if (!lokasiKlinik) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Lokasi Klinik not found",
      });
    }

    if (lokasiKlinik.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not authorized to delete this Lokasi Klinik",
      });
    }

    if (lokasiKlinik.image) tryDeleteUpload(lokasiKlinik.image);
    await lokasiKlinik.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/lokasi-klinik",
      resourceId: lokasiKlinik.id,
      description: `Deleted lokasi klinik: "${lokasiKlinik.title}" (ID: ${lokasiKlinik.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Lokasi Klinik deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLokasiKlinik,
  getAllLokasiKlinik,
  getLokasiKlinikByIdentifier,
  updateLokasiKlinik,
  deleteLokasiKlinik,
};
