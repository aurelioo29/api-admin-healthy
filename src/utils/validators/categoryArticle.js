const { check } = require("express-validator");

const validateCategoryArticlePost = [
  check("name")
    .notEmpty()
    .withMessage("Name Category is required")
    .isLength({ max: 50 })
    .withMessage("Name must be at most 50 characters long"),
];

const validateCategoryArticleUpdate = [
  check("name")
    .notEmpty()
    .withMessage("Name Category is required")
    .isLength({ max: 50 })
    .withMessage("Name must be at most 50 characters long"),
];

module.exports = { validateCategoryArticlePost, validateCategoryArticleUpdate };