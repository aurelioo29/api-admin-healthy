const { check } = require("express-validator");

const validateTestimoniPost = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters long"),

  check("age")
    .notEmpty()
    .withMessage("Age is required")
    .isInt({ min: 0 })
    .withMessage("Age must be a non-negative integer"),

  check("job")
    .notEmpty()
    .withMessage("Job is required")
    .isLength({ max: 100 })
    .withMessage("Job must be at most 100 characters long"),

  check("content").notEmpty().withMessage("Content is required"),
];

const validateTestimoniUpdate = [
  check("name")
    .optional()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters long"),

  check("age")
    .optional()
    .notEmpty()
    .withMessage("Age cannot be empty")
    .isInt({ min: 0 })
    .withMessage("Age must be a non-negative integer"),

  check("job")
    .optional()
    .notEmpty()
    .withMessage("Job cannot be empty")
    .isLength({ max: 100 })
    .withMessage("Job must be at most 100 characters long"),

  check("content").optional().notEmpty().withMessage("Content cannot be empty"),
];

module.exports = { validateTestimoniPost, validateTestimoniUpdate };
