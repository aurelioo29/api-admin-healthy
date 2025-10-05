const express = require("express");
const router = express.Router();
const { aboutUsController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/about-us", aboutUsController.getListAboutUs);
router.post(
  "/upload/about-us",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsController.createAboutUs
);
router.put(
  "/upload/about-us/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsController.updateAboutUs
);
router.delete(
  "/upload/about-us/:id",
  rateLimiter,
  isAuthenticated,
  aboutUsController.deleteAboutUs
);

module.exports = router;
