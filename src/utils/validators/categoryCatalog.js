const { check } = require("express-validator");

const validateCatalogCategoryPost = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters long"),
];

const validateCatalogCategoryUpdate = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters long"),
];

module.exports = {
  validateCatalogCategoryPost,
  validateCatalogCategoryUpdate,
};
