const { check } = require("express-validator");

const isDateOnly = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || ""));

const validateCatalogPost = [
  check("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 150 })
    .withMessage("Title max 150 chars"),

  check("content").notEmpty().withMessage("Content is required"),

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .custom(isDateOnly)
    .withMessage("Date must be YYYY-MM-DD"),

  check("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be draft|published"),

  check("category_id").isInt({ min: 1 }).withMessage("category_id is required"),

  check("price_original")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_original must be >= 0")
    .toFloat(),

  check("price_discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_discount must be >= 0")
    .toFloat()
    .custom((v, { req }) => {
      const p0 = Number(req.body.price_original ?? v);
      if (!Number.isFinite(v) || !Number.isFinite(p0)) return true;
      if (v > p0)
        throw new Error("price_discount cannot exceed price_original");
      return true;
    }),

  check("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 8 })
    .withMessage("currency length 3–8"),

  check("wa_text")
    .not()
    .exists()
    .withMessage("wa_text is generated automatically"),
];

const validateCatalogUpdate = [
  check("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 150 })
    .withMessage("Title max 150 chars"),

  check("content").optional().notEmpty().withMessage("Content cannot be empty"),

  check("date")
    .optional()
    .custom(isDateOnly)
    .withMessage("Date must be YYYY-MM-DD"),

  check("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be draft|published"),

  check("category_id").isInt({ min: 1 }).withMessage("category_id is required"),

  check("price_original")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_original must be >= 0")
    .toFloat(),

  check("price_discount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("price_discount must be >= 0")
    .toFloat()
    .custom((v, { req }) => {
      const p0 =
        req.body.price_original != null
          ? Number(req.body.price_original)
          : undefined;
      if (p0 != null && Number.isFinite(v) && v > p0) {
        throw new Error("price_discount cannot exceed price_original");
      }
      return true;
    }),

  check("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 8 })
    .withMessage("currency length 3–8"),

  check("wa_text")
    .not()
    .exists()
    .withMessage("wa_text is generated automatically"),
];

module.exports = {
  validateCatalogPost,
  validateCatalogUpdate,
};
