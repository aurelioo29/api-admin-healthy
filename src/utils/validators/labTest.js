const { body } = require("express-validator");

const validateLabTestPost = [
  body("title")
    .isString()
    .isLength({ min: 2, max: 150 })
    .withMessage("Title is required"),
  body("content")
    .isString()
    .isLength({ min: 5 })
    .withMessage("Content is required"),
  body("date").isISO8601().withMessage("Valid date is required"),
  body("category_id").isInt({ min: 1 }).withMessage("category_id is required"),
];

const validateLabTestUpdate = [
  body("title").optional().isString().isLength({ min: 2, max: 150 }),
  body("content").optional().isString().isLength({ min: 5 }),
  body("date").optional().isISO8601(),
  body("category_id").optional().isInt({ min: 1 }),
];

module.exports = {
  validateLabTestPost,
  validateLabTestUpdate,
};
