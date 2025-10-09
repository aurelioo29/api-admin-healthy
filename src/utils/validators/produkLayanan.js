const { check } = require("express-validator");

const validateCreateProdukLayanan = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("target_link").notEmpty().withMessage("Target link is required"),
];

const validateUpdateProdukLayanan = [
  check("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("target_link")
    .optional()
    .notEmpty()
    .withMessage("Target link cannot be empty"),
];

module.exports = { validateCreateProdukLayanan, validateUpdateProdukLayanan };
