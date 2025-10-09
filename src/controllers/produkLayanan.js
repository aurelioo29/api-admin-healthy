const { Op } = require("sequelize");
const ProdukLayanan = require("../models/produkLayanan");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");

const createProdukLayanan = async (req, res, next) => {
  try {
    const { title, content, target_link } = req.body;

    const image = relPathFromFile(req.file);

    const newCreate = await ProdukLayanan.create({
      title,
      content,
      image,
      target_link,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/produk-layanan",
      resourceId: newCreate.id,
      description: `Created Produk Layanan: "${newCreate.title}" (ID: ${newCreate.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = newCreate.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(201).json({
      code: 201,
      success: true,
      message: "Produk Layanan created successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const getAllProdukLayanan = async (req, res, next) => {
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

    const { count: totalProdukLayanan, rows } =
      await ProdukLayanan.findAndCountAll({
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

    const produkLayanans = rows.map((r) => {
      const json = r.toJSON();
      return {
        ...json,
        imageUrl: toPublicUrl(req, json.image),
      };
    });

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Produk Layanan retrieved successfully",
      data: {
        produkLayanans,
        totalProdukLayanan,
        totalPages: Math.max(Math.ceil(totalProdukLayanan / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    console.error(
      "getAllProdukLayanan error:",
      error?.parent?.sqlMessage || error.message
    );
    next(error);
  }
};

const getProdukLayananByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const produkLayanan = await ProdukLayanan.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    if (!produkLayanan) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Produk Layanan not found",
      });
    }

    const json = produkLayanan.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Produk Layanan retrieved successfully",
      data: json,
    });
  } catch (error) {
    next(error);
  }
};

const updateProdukLayanan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, target_link } = req.body;

    const produkLayanan = await ProdukLayanan.findByPk(id);
    if (!produkLayanan) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Produk Layanan not found",
      });
    }

    if (title) produkLayanan.title = title;
    if (content) produkLayanan.content = content;
    if (target_link) produkLayanan.target_link = target_link;

    if (req.file) {
      const newRelPath = relPathFromFile(req.file);
      if (produkLayanan.image && produkLayanan.image !== newRelPath) {
        tryDeleteUpload(produkLayanan.image);
      }
      produkLayanan.image = newRelPath;
    }

    await produkLayanan.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/produk-layanan",
      resourceId: produkLayanan.id,
      description: `Updated Produk Layanan: "${produkLayanan.title}" (ID: ${produkLayanan.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = produkLayanan.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);

    res.status(200).json({
      code: 200,
      success: true,
      message: "Produk Layanan updated successfully",
      data: produkLayanan,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProdukLayanan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const produkLayanan = await ProdukLayanan.findByPk(id);
    if (!produkLayanan) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Produk Layanan not found",
      });
    }

    if (produkLayanan.image) tryDeleteUpload(produkLayanan.image);
    await produkLayanan.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/produk-layanan",
      resourceId: produkLayanan.id,
      description: `Deleted Produk Layanan: "${produkLayanan.title}" (ID: ${produkLayanan.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Produk Layanan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProdukLayanan,
  getAllProdukLayanan,
  getProdukLayananByIdentifier,
  updateProdukLayanan,
  deleteProdukLayanan,
};
