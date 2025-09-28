const { body } = require("express-validator");

const validateLabTestCategoryPost = [
  body("name")
    .isString()
    .isLength({ min: 2, max: 200 })
    .withMessage("Name is required"),
  body("description").optional().isString(),
];

const validateLabTestCategoryUpdate = [
  body("name").optional().isString().isLength({ min: 2, max: 200 }),
  body("description").optional().isString(),
];

module.exports = {
  validateLabTestCategoryPost,
  validateLabTestCategoryUpdate,
};
