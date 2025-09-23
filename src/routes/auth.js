const express = require("express");
const router = express.Router();
const { authController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateSignup,
  validateSignin,
  emailValidator,
  recoverPasswordValidator,
  verifyUserValidator,
  validateCreateUserBySuperAdmin,
} = require("../utils/validators/auth");

/**
 * ! Routes Sign-Up and Sign-In
 * ? These routes handle user registration and login, including validation and rate limiting.
 */
router.post(
  "/auth/signup",
  rateLimiter,
  validateSignup,
  validate,
  authController.signup
);
router.post(
  "/auth/signin",
  rateLimiter,
  validateSignin,
  validate,
  authController.signin
);

/**
 *
 */
router.post(
  "/auth/verification",
  verifyUserValidator,
  validate,
  authController.verifyUser
);
router.post(
  "/auth/resend-verification-code",
  rateLimiter,
  emailValidator,
  validate,
  authController.resendVerificationCode
);

/**
 * ! Routes for Password Recovery
 * ? These routes handle the process of recovering a user's password, including sending verification codes and resetting passwords.
 */
router.post(
  "/auth/forgot-password-code",
  rateLimiter,
  emailValidator,
  validate,
  authController.forgetPasswordCode
);
router.post(
  "/auth/recover-password",
  recoverPasswordValidator,
  validate,
  authController.recoverPassword
);

router.post(
  "/auth/create-users",
  isAuthenticated,
  validateCreateUserBySuperAdmin,
  validate,
  authController.createUserBySuperAdmin
);

router.post("/test-email", authController.testSendEmail);

router.get("/users", isAuthenticated, authController.getUsers);

module.exports = router;
