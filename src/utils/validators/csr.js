const { check } = require("express-validator");

const validateCsrPost = [
  check("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("content").notEmpty().withMessage("Content is required"),

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

const validateCsrUpdate = [
  check("title")
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Title must be at most 100 characters long"),

  check("content").optional(),

  check("date")
    .notEmpty()
    .withMessage("Date cannot be empty")
    .isISO8601()
    .withMessage("Date must be a valid ISO8601 date"),

  check("status")
    .notEmpty()
    .withMessage("Status cannot be empty")
    .isIn(["draft", "published"])
    .withMessage("Status must be either 'draft' or 'published'"),
];

module.exports = { validateCsrPost, validateCsrUpdate };
