const express = require("express");
const router = express.Router();
const { testimoniController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateTestimoniPost,
  validateTestimoniUpdate,
} = require("../utils/validators/testimoni");
const { upload } = require("../utils/uploads");

router.get("/upload/testimonis", testimoniController.getAllTestimonis);

router.get(
  "/upload/testimonis/:identifier",
  testimoniController.getTestimoniByIdentifier
);

router.post(
  "/upload/testimonis",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateTestimoniPost,
  validate,
  testimoniController.createTestimoni
);

router.put(
  "/upload/testimonis/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateTestimoniUpdate,
  validate,
  testimoniController.updateTestimoni
);

router.delete(
  "/upload/testimonis/:id",
  rateLimiter,
  isAuthenticated,
  testimoniController.deleteTestimoni
);

module.exports = router;
