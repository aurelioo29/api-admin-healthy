const { Op } = require("sequelize");
const sequelize = require("../config/database");
const HeroSection = require("../models/hero_section");
const HeroSectionI18n = require("../models/hero_section_i18n");
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

const prettifyFilename = (name = "") => {
  const base = String(name).replace(/\.[^/.]+$/, "");
  const spaced = base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
  return spaced
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
};

const pickTitle = (rows = [], loc) =>
  rows.find((r) => String(r.locale).toLowerCase() === loc)?.title?.trim() || "";

const PAGE_KEYS = new Set([
  "home",
  "about",
  "lab_tests",
  "consultation",
  "clinic_services",
  "corporate_health_service",
  "e_catalog",
  "csr",
  "articles",
  "investor_relations",
  "location",
]);

const normPageKey = (v) => {
  const s = String(v || "").trim();
  return PAGE_KEYS.has(s) ? s : null;
};

const getListHeroSection = async (req, res, next) => {
  try {
    let { search, size, page, locale = "all", page_key } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    const where = {};

    const pk = normPageKey(page_key);
    if (pk) where.page_key = pk;

    if (search) {
      where[Op.or] = [{ page_key: { [Op.like]: `%${search}%` } }];
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
      model: HeroSectionI18n,
      as: "i18n",
      where: Object.keys(i18nWhere).length ? i18nWhere : undefined,
      required: !!search || isOneLocale,
    };

    const { count: total, rows } = await HeroSection.findAndCountAll({
      where,
      include: [
        includeI18n,
        { model: User, as: "author", attributes: ["id", "username", "email"] },
      ],
      order: [["id", "ASC"]],
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
        page_key: j.page_key,
        position: j.position,
        is_active: j.is_active,
        created_at: j.created_at,
        image: j.image,
        imageUrl,
        image_alt: j.image_alt || "", // (opsional) kirim alt juga
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
          cta_text: t.cta_text || "",
          cta_link: t.cta_link || "",
        })),
      };
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Hero sections retrieved successfully",
      data: {
        sections,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    console.error(
      "getListHeroSection error:",
      error?.parent?.sqlMessage || error.message
    );
    next(error);
  }
};

const createHeroSection = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const rawKey = req.body.page_key;
    const pageKey = normPageKey(rawKey);
    if (!pageKey) {
      await t.rollback();
      return res.status(400).json({
        code: 400,
        success: false,
        message: "page_key is required and must be a valid enum.",
      });
    }

    // cek unik per page_key
    const existed = await HeroSection.findOne({
      where: { page_key: pageKey },
      transaction: t,
    });
    if (existed) {
      await t.rollback();
      return res.status(409).json({
        code: 409,
        success: false,
        message: `Hero for page_key "${pageKey}" already exists.`,
      });
    }

    // parse i18n lebih dulu agar bisa dipakai untuk fallback alt
    const parsedI18n = parseI18nFromBody(req.body, {
      locales: ["id", "en"],
      ensureLocales: true,
      includeSubtitle: true,
      extraFields: ["cta_text", "cta_link"],
    });

    // siapkan alt: pakai yg dikirim FE, jika kosong pakai title id/en, lalu nama file, lalu page_key
    const providedAlt = String(req.body.image_alt ?? "").trim();
    const titleId = pickTitle(parsedI18n, "id");
    const titleEn = pickTitle(parsedI18n, "en");
    const fileNameAlt = req.file?.originalname
      ? prettifyFilename(req.file.originalname)
      : "";
    const computedAlt =
      providedAlt || titleId || titleEn || fileNameAlt || `${pageKey} hero`;

    const payload = {
      page_key: pageKey,
      position: normPos(req.body.position || "left"),
      is_active: normBool(req.body.is_active ?? true) ?? true,
      image: relPathFromFile(req.file),
      image_alt: computedAlt, // ✅ simpan alt
      author_id: req.user.id,
    };

    const section = await HeroSection.create(payload, { transaction: t });

    const i18nRows = parsedI18n.map((tr) => ({
      section_id: section.id,
      locale: tr.locale,
      title: tr.title || "",
      subtitle: tr.subtitle || "",
      body_html: tr.body_html || "",
      cta_text: tr.cta_text || "",
      cta_link: tr.cta_link || "",
    }));

    await HeroSectionI18n.bulkCreate(i18nRows, {
      ignoreDuplicates: true,
      transaction: t,
    });

    await t.commit();

    await logActivity({
      userId: req.user.id,
      action: "CREATE",
      resource: "/upload/hero-sections",
      resourceId: section.id,
      description: `Create hero section ${section.id} (${pageKey})`,
    });

    const created = section.toJSON();
    created.imageUrl = toPublicUrl(req, created.image);

    return res.status(201).json({
      code: 201,
      success: true,
      message: "Hero section created successfully",
      data: created,
    });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

const updateHeroSection = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = Number(req.params.id);
    const section = await HeroSection.findByPk(id, { transaction: t });
    if (!section) {
      await t.rollback();
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Hero section not found" });
    }

    // ------- PATCH FIELDS (hero_sections) -------
    const patch = {};

    // page_key (unik)
    if (req.body.page_key != null) {
      const pk = normPageKey(req.body.page_key);
      if (!pk) {
        await t.rollback();
        return res.status(400).json({
          code: 400,
          success: false,
          message: "Invalid page_key",
        });
      }
      if (pk !== section.page_key) {
        const exists = await HeroSection.findOne({
          where: { page_key: pk },
          transaction: t,
        });
        if (exists) {
          await t.rollback();
          return res.status(409).json({
            code: 409,
            success: false,
            message: `Hero for page_key "${pk}" already exists.`,
          });
        }
      }
      patch.page_key = pk;
    }

    if (req.body.position != null) {
      patch.position = normPos(req.body.position);
    }
    if (req.body.is_active != null) {
      patch.is_active = normBool(req.body.is_active);
    }

    // image (hapus lama kalau ganti)
    if (req.file) {
      const newRel = relPathFromFile(req.file);
      if (section.image && section.image !== newRel) {
        tryDeleteUpload(section.image);
      }
      patch.image = newRel;
    }

    // image_alt:
    // - kalau dikirim => pakai yg dikirim (trim, bisa kosong -> null)
    // - kalau tidak dikirim tapi ada file baru & alt lama kosong -> generate dari title / filename / page_key
    if (Object.prototype.hasOwnProperty.call(req.body, "image_alt")) {
      patch.image_alt = String(req.body.image_alt ?? "").trim() || null;
    } else if (req.file && !section.image_alt) {
      // nanti kita isi setelah kita tahu title dari parsedI18n / fallback
      // (taruh sementara; kalau ternyata tidak dapat title, minimal pakai nama file / page_key)
      const fileNameAlt = req.file?.originalname
        ? prettifyFilename(req.file.originalname)
        : "";
      patch.image_alt =
        fileNameAlt || patch.page_key || section.page_key || "Hero image";
    }

    if (Object.keys(patch).length) {
      await HeroSection.update(patch, { where: { id }, transaction: t });
    }

    // ------- I18N (hero_section_i18n) -------
    let parsedI18n = parseI18nFromBody(req.body, {
      locales: ["id", "en"],
      ensureLocales: false,
      includeSubtitle: true,
      extraFields: ["cta_text", "cta_link"],
    });

    // Merge fallback dari ?locale= + flat fields (title, subtitle, body_html, cta_text, cta_link)
    const loc = String(req.query.locale || "").toLowerCase();
    if (loc === "id" || loc === "en") {
      const fallback = {
        title: req.body.title ?? "",
        subtitle: req.body.subtitle ?? "",
        body_html: req.body.body_html ?? "",
        cta_text: req.body.cta_text ?? "",
        cta_link: req.body.cta_link ?? "",
      };

      if (parsedI18n.length > 0) {
        parsedI18n = parsedI18n.map((row) =>
          row.locale === loc
            ? {
                ...row,
                title: row.title || fallback.title,
                subtitle: row.subtitle || fallback.subtitle,
                body_html: row.body_html || fallback.body_html,
                cta_text: row.cta_text || fallback.cta_text,
                cta_link: row.cta_link || fallback.cta_link,
              }
            : row
        );
      } else if (
        fallback.title ||
        fallback.subtitle ||
        fallback.body_html ||
        fallback.cta_text ||
        fallback.cta_link
      ) {
        parsedI18n = [{ locale: loc, ...fallback }];
      }
    }

    if (parsedI18n.length > 0) {
      const rows = parsedI18n.map((tr) => ({
        section_id: id,
        locale: tr.locale,
        title: tr.title || "",
        subtitle: tr.subtitle || "",
        body_html: tr.body_html || "",
        cta_text: tr.cta_text || "",
        cta_link: tr.cta_link || "",
      }));

      await HeroSectionI18n.bulkCreate(rows, {
        updateOnDuplicate: [
          "title",
          "subtitle",
          "body_html",
          "cta_text",
          "cta_link",
        ],
        transaction: t,
      });

      // Jika tadi kita belum yakin alt-nya & tidak ada image_alt yang dikirim, coba update lagi alt dari title
      if (!Object.prototype.hasOwnProperty.call(req.body, "image_alt")) {
        const titleId = pickTitle(rows, "id");
        const titleEn = pickTitle(rows, "en");
        const finalAlt =
          (titleId || titleEn || section.image_alt || "").trim() ||
          prettifyFilename(req.file?.originalname || "") ||
          patch.page_key ||
          section.page_key ||
          "Hero image";

        // update ringan tanpa merusak transaksi (masih dalam t)
        await HeroSection.update(
          { image_alt: finalAlt },
          { where: { id }, transaction: t }
        );
      }
    } else if (loc === "id" || loc === "en") {
      // fallback upsert single-locale (kalau parser kosong total)
      await HeroSectionI18n.upsert(
        {
          section_id: id,
          locale: loc,
          title: req.body.title || "",
          subtitle: req.body.subtitle || "",
          body_html: req.body.body_html || "",
          cta_text: req.body.cta_text || "",
          cta_link: req.body.cta_link || "",
        },
        { transaction: t }
      );
    }

    await t.commit();

    await logActivity({
      userId: req.user.id,
      action: "UPDATE",
      resource: "/upload/hero-sections",
      resourceId: id,
      description: `Update hero section ${id}`,
    });

    // kembalikan data teranyar
    const updated = await HeroSection.findByPk(id, {
      include: [
        { model: HeroSectionI18n, as: "i18n" },
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

const deleteHeroSection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const section = await HeroSection.findByPk(id);

    if (!section) {
      return res
        .status(404)
        .json({ code: 404, success: false, message: "Not found" });
    }

    if (section.image) tryDeleteUpload(section.image);
    // i18n akan ikut terhapus jika FK CASCADE, tapi aman kita bersihkan manual:
    await HeroSectionI18n.destroy({ where: { section_id: id } });
    await section.destroy();

    await logActivity({
      userId: req.user.id,
      action: "DELETE",
      resource: "/upload/hero-sections",
      resourceId: id,
      description: `Delete hero section ${id}`,
      ipAddress: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(200).json({
      code: 200,
      success: true,
      message: "Hero section deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getListHeroSection,
  createHeroSection,
  updateHeroSection,
  deleteHeroSection,
};
