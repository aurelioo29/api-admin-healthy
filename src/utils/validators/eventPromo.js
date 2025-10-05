const { check } = require("express-validator");

const validateEventPromoPost = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),

  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
];

const validateEventPromoUpdate = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("date")
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),

  check("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
];

module.exports = { validateEventPromoPost, validateEventPromoUpdate };
