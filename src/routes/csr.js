const express = require("express");
const router = express.Router();
const { csrController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateCsrPost,
  validateCsrUpdate,
} = require("../utils/validators/csr");
const isAuthenticated = require("../middlewares/isAuthenticated");
const upload = require("../middlewares/multer");

router.get("/upload/csr", isAuthenticated, csrController.getAllCsrPosts);
router.get("/uploads/csr/:id", isAuthenticated, csrController.getCsrPostbyId);
router.get(
  "/upload/csr/:slug",
  isAuthenticated,
  csrController.getCsrPostbySlug
);
router.post(
  "/upload/csr",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCsrPost,
  validate,
  csrController.createCsrPost
);
router.put(
  "/upload/csr/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCsrUpdate,
  validate,
  csrController.updateCsrPost
);
router.delete(
  "/upload/csr/:id",
  rateLimiter,
  isAuthenticated,
  csrController.deleteCsrPost
);

module.exports = router;
