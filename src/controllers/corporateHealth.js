const { Op } = require("sequelize");
const sequelize = require("../config/database");
const CorporateHealth = require("../models/corporate_health");
const CorporateHealthI18n = require("../models/corporate_health_i18n");
const User = require("../models/User");
const logActivity = require("../helpers/logActivity");
const {
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
} = require("../utils/uploads");
const parseI18nFromBody = require("../helpers/i18n");

const normBool = (v) => {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "")
    .toLowerCase()
    .trim();
  return s === "true" || s === "1" || s === "on" || s === "yes";
};

const normPos = (v) => (String(v).toLowerCase() === "right" ? "right" : "left");

const normInt = (v, d = 1) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : d;
};

const getListCorporateHealth = async (req, res, next) => {
  try {
    let { search, size, page, locale = "all", active = "true" } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};
    // if (active !== undefined) {
    //   const isActive =
    //     typeof active === "string" ? active !== "false" : !!active;
    //   where.is_active = isActive;
    // }

    if (search) {
      where[Op.or] = [{ section_key: { [Op.like]: `%${search}%` } }];
    }

    const normLocale = String(locale).toLowerCase();
    const isOneLocale = normLocale === "id" || normLocale === "en";

    const i18nWhere = {};
    if (isOneLocale) i18nWhere.locale = normLocale;

    if (search) {
      i18nWhere[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { subtitle: { [Op.like]: `%${search}%` } },
        { body_html: { [Op.like]: `%${search}%` } },
      ];
    }

    const includeI18n = {
      model: CorporateHealthI18n,
      as: "i18n",
      where: Object.keys(i18nWhere).length ? i18nWhere : undefined,
      required: !!search || isOneLocale,
    };

    const { count: total, rows } = await CorporateHealth.findAndCountAll({
      where,
      include: [
        includeI18n,
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
      order: [
        ["order_no", "ASC"],
        ["id", "ASC"],
      ],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    const sections = rows.map((r) => {
      const j = r.toJSON();
      const imageUrl = toPublicUrl(req, j.image);

      const translations = Array.isArray(j.i18n)
        ? j.i18n
        : j.i18n
        ? [j.i18n]
        : [];

      return {
        id: j.id,
        section_key: j.section_key,
        position: j.position,
        order_no: j.order_no,
        is_active: j.is_active,
        created_at: j.created_at,
        image: j.image,
        imageUrl,
        author: j.author
          ? {
              id: j.author.id,
              username: j.author.username,
              email: j.author.email,
            }
          : null,

        i18n: translations.map((t) => ({
          locale: t.locale,
          title: t.title || "",
          subtitle: t.subtitle || "",
          body_html: t.body_html || "",
        })),
      };
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Corporate Health retrieved successfully",
      data: {
        sections,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        currentPage,
      },
    });
  } catch (err) {
    console.error(
      "getListCorporateHealth error:",
      err?.parent?.sqlMessage || err.message
    );
    next(err);
  }
};

const createCorporateHealth = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const rawKey = req.body.section_key;
    if (!rawKey || !String(rawKey).trim()) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        success: false,
        message: "section_key is required",
      });
    }

    const payload = {
      section_key: String(rawKey).trim(),
      position: normPos(req.body.position || "left"),
      order_no: normInt(req.body.order_no, 1),
      is_active: normBool(req.body.is_active ?? true),
      image: relPathFromFile(req.file),
      author_id: req.user.id,
    };

    const section = await CorporateHealth.create(payload, { transaction: t });

    // i18n bisa datang dalam 2 bentuk (bracket & flat); kita support dua-duanya
    const i18nRows = parseI18nFromBody(req.body, {
      locales: ["id", "en"],
      ensureLocales: true, // buat dua locale jika kosong
      includeSubtitle: true, // set false kalau kamu tidak pakai subtitle
    }).map((tr) => ({
      section_id: section.id,
      locale: tr.locale,
      title: tr.title || "",
      subtitle: tr.subtitle || "",
      body_html: tr.body_html || "",
    }));

    await CorporateHealthI18n.bulkCreate(i18nRows, {
      ignoreDuplicates: true, // butuh unique index (section_id, locale)
      transaction: t,
    });

    await t.commit();

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/corporate-health",
      resourceId: section.id,
      description: `Create corporate health section ${section.id}`,
    });

    const created = section.toJSON();
    created.imageUrl = toPublicUrl(req, created.image);

    return res.status(201).json({
      code: 201,
      success: true,
      message: "Corporate health created successfully",
      data: created,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const updateCorporateHealth = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = Number(req.params.id);
    const section = await CorporateHealth.findByPk(id, { transaction: t });
    if (!section) {
      await t.rollback();
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Corporate health not found",
      });
    }

    const patch = {};
    if (req.body.section_key != null && String(req.body.section_key).trim()) {
      patch.section_key = String(req.body.section_key).trim();
    }
    if (req.body.position != null) {
      patch.position = normPos(req.body.position);
    }
    if (req.body.order_no != null) {
      patch.order_no = normInt(req.body.order_no, section.order_no || 1);
    }
    if (req.body.is_active != null) {
      patch.is_active = normBool(req.body.is_active);
    }

    // handle image
    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (section.image && section.image !== newRel) {
        tryDeleteUpload(section.image); // optional: hapus lama
      }
      patch.image = newRel;
    }

    if (Object.keys(patch).length) {
      await CorporateHealth.update(patch, { where: { id }, transaction: t });
    }

    // ==== I18N ====
    // 1) jika body mengandung i18n (bracket/flat), parse & upsert banyak locale
    const parsedI18n = parseI18nFromBody(req.body, {
      locales: ["id", "en"],
      ensureLocales: false, // penting: agar tidak membuat entri kosong jika tidak dikirim
      includeSubtitle: true,
    });

    if (parsedI18n.length > 0) {
      const rows = parsedI18n.map((tr) => ({
        section_id: id,
        locale: tr.locale,
        title: tr.title || "",
        subtitle: tr.subtitle || "",
        body_html: tr.body_html || "",
      }));
      await CorporateHealthI18n.bulkCreate(rows, {
        updateOnDuplicate: ["title", "subtitle", "body_html"],
        transaction: t,
      });
    } else {
      // 2) fallback: ?locale=id/en + field flat (title, subtitle, body_html)
      const loc = String(req.query.locale || "").toLowerCase();
      if (loc === "id" || loc === "en") {
        await CorporateHealthI18n.upsert(
          {
            section_id: id,
            locale: loc,
            title: req.body.title || "",
            subtitle: req.body.subtitle || "",
            body_html: req.body.body_html || "",
          },
          { transaction: t }
        );
      }
    }

    await t.commit();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/corporate-health",
      resourceId: id,
      description: `Update corporate health section ${id}`,
    });

    // Ambil ulang untuk response yang lebih informatif (opsional)
    const updated = await CorporateHealth.findByPk(id, {
      include: [
        {
          model: CorporateHealthI18n,
          as: "i18n",
          // attributes: ['locale','title','subtitle','body_html'],
        },
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
    });

    const j = updated ? updated.toJSON() : section.toJSON();
    j.imageUrl = toPublicUrl(req, j.image);

    return res.json({ code: 200, success: true, data: j });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const deleteCorporateHealth = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await CorporateHealth.findByPk(id);
    if (!section)
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Not found" });

    if (section.image) tryDeleteUpload(section.image);
    await CorporateHealthI18n.destroy({ where: { section_id: id } });
    await section.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/corporate-health",
      resourceId: id,
      description: `Delete corporate health ${id}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });
    res.status(200).json({
      code: 200,
      success: true,
      message: "Corporate health deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getListCorporateHealth,
  createCorporateHealth,
  updateCorporateHealth,
  deleteCorporateHealth,
};
