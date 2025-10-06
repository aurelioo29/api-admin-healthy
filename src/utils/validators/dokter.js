const { check } = require("express-validator");

const validateCreateDokterValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 150 })
    .withMessage("Name must be at most 150 characters"),
  check("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ max: 100 })
    .withMessage("Specialization must be at most 100 characters"),
];

const validateUpdateDokterValidator = [
  check("name")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 150 })
    .withMessage("Name must be at most 150 characters"),
  check("specialization")
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ max: 100 })
    .withMessage("Specialization must be at most 100 characters"),
];

module.exports = {
  validateCreateDokterValidator,
  validateUpdateDokterValidator,
};
