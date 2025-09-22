const { check, body } = require("express-validator");

/**
 *
 */
const validateSignup = [
  check("username")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters long"),

  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail(),

  check("password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .notEmpty()
    .withMessage("Password is required"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm Password is required"),
];

const validateSignin = [
  // Custom validator: wajib ada salah satu dari email / username
  body().custom((value, { req }) => {
    if (!req.body.email && !req.body.username) {
      throw new Error("Email or Username is required");
    }
    return true;
  }),

  // Optional email validator (tapi kalau diisi harus valid)
  check("email")
    .optional()
    .isEmail()
    .withMessage("Please enter a valid email address")
    .normalizeEmail(),

  // Optional username validator (tapi kalau diisi, minimal 3 karakter misalnya)
  check("username")
    .optional()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .trim(),

  // Password wajib
  check("password").notEmpty().withMessage("Password is required"),
];

/**
 *
 */
const emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail(),
];

const recoverPasswordValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail(),

  check("code").notEmpty().withMessage("Verification code is required"),

  check("password")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .notEmpty()
    .withMessage("Password is required"),

  check("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

/**
 *
 */
const verifyUserValidator = [
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail(),

  check("code").notEmpty().withMessage("Verification code is required"),
];

module.exports = {
  validateSignup,
  validateSignin,
  emailValidator,
  recoverPasswordValidator,
  verifyUserValidator,
};
