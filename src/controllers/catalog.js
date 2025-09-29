const { Op } = require("sequelize");
const Catalog = require("../models/Catalog");
const User = require("../models/User");
const CategoryCatalog = require("../models/CategoryCatalog");
const generateUniqueSlug = require("../helpers/generateUniqueSlug");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");
const { buildWaLink } = require("../utils/wa");

/* ---------------------------------------
 * CREATE
 * -------------------------------------*/
const createCatalog = async (req, res, next) => {
  try {
    const {
      title,
      content,
      date,
      status,
      category_id,
      price_original = 0,
      price_discount = 0,
      currency = "IDR",
    } = req.body;

    // slug + image
    const slug = await generateUniqueSlug(Catalog, title);
    const image = relPathFromFile(req.file);

    // validasi harga
    const p0 = Number(price_original || 0);
    let p1 = Number(price_discount || 0);
    if (Number.isNaN(p0) || Number.isNaN(p1)) {
      return res
        .status(400)
        .json({ code: 400, success: false, message: "Invalid price value" });
    }
    if (p0 < 0 || p1 < 0) {
      return res.status(400).json({
        code: 400,
        success: false,
        message: "Price cannot be negative",
      });
    }
    if (p1 > p0) p1 = p0;

    // auto wa_text dari title
    const wa_text = `Halo, saya ingin menanyakan Layanan ${title}`;

    const row = await Catalog.create({
      title,
      slug,
      content,
      image,
      date,
      status: status === "published" ? "published" : "draft",
      category_id,
      price_original: p0,
      price_discount: p1,
      currency,
      wa_text,
      author_id: req.user.id,
    });

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/catalogs",
      resourceId: row.id,
      description: `Created catalog "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);
    json.waLink = buildWaLink({ title: json.title });

    res.status(201).json({
      code: 201,
      success: true,
      message: "Catalog created successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
 * LIST
 * query: search, size, page, status, category_id
 * -------------------------------------*/
const getAllCatalogs = async (req, res, next) => {
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

    const { count: totalCatalogs, rows } = await Catalog.findAndCountAll({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryCatalog,
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

    const catalogs = rows.map((r) => {
      const j = r.toJSON();
      j.imageUrl = toPublicUrl(req, j.image);
      j.waLink = buildWaLink({ title: j.title });
      return j;
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Catalogs retrieved successfully",
      data: {
        catalogs,
        totalCatalogs,
        totalPages: Math.max(Math.ceil(totalCatalogs / limit), 1),
        currentPage,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
 * DETAIL by slug or id
 * -------------------------------------*/
const getCatalogByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isNumeric = /^\d+$/.test(identifier);

    const where = isNumeric
      ? { id: parseInt(identifier, 10) }
      : { slug: identifier };

    const row = await Catalog.findOne({
      where,
      include: [
        { model: User, as: "author", attributes: ["id", "username", "email"] },
        {
          model: CategoryCatalog,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Catalog not found" });
    }

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);
    json.waLink = buildWaLink({ title: json.title });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Catalog retrieved successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
 * UPDATE
 * -------------------------------------*/
const updateCatalog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const {
      title,
      content,
      date,
      status,
      category_id,
      price_original,
      price_discount,
      currency,
    } = req.body;

    const row = await Catalog.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Catalog not found" });
    }
    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not author",
      });
    }

    // judul berubah -> slug & wa_text ikut
    if (title && title !== row.title) {
      row.slug = await generateUniqueSlug(Catalog, title);
      row.title = title;
      row.wa_text = `Halo, saya ingin menanyakan Layanan ${title}`;
    }

    if (content != null) row.content = content;
    if (date) row.date = date;
    if (status) row.status = status === "published" ? "published" : "draft";
    if (category_id) row.category_id = category_id;
    if (currency) row.currency = currency;

    // harga
    if (price_original != null || price_discount != null) {
      const p0 = Number(
        price_original != null ? price_original : row.price_original || 0
      );
      let p1 = Number(
        price_discount != null ? price_discount : row.price_discount || 0
      );
      if (Number.isNaN(p0) || Number.isNaN(p1)) {
        return res
          .status(400)
          .json({ code: 400, success: false, message: "Invalid price value" });
      }
      if (p0 < 0 || p1 < 0) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Price cannot be negative",
        });
      }
      if (p1 > p0) p1 = p0;
      row.price_original = p0;
      row.price_discount = p1;
    }

    // image baru?
    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (row.image && row.image !== newRel) tryDeleteUpload(row.image);
      row.image = newRel;
    }

    await row.save();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/catalogs",
      resourceId: row.id,
      description: `Updated catalog "${row.title}" (ID: ${row.id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    const json = row.toJSON();
    json.imageUrl = toPublicUrl(req, json.image);
    json.waLink = buildWaLink({ title: json.title });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Catalog updated successfully",
      data: json,
    });
  } catch (err) {
    next(err);
  }
};

/* ---------------------------------------
 * DELETE
 * -------------------------------------*/
const deleteCatalog = async (req, res, next) => {
  try {
    const { id } = req.params;

    const row = await Catalog.findByPk(id);
    if (!row) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Catalog not found" });
    }
    if (row.author_id !== req.user.id) {
      return res.status(403).json({
        code: 403,
        success: false,
        message: "Unauthorized: Not author",
      });
    }

    if (row.image) tryDeleteUpload(row.image);
    await row.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/catalogs",
      resourceId: id,
      description: `Deleted catalog "${row.title}" (ID: ${id})`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Catalog deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCatalog,
  getAllCatalogs,
  getCatalogByIdentifier,
  updateCatalog,
  deleteCatalog,
};
