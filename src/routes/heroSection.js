const express = require("express");
const router = express.Router();
const { HeroSectionController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/hero-sections", HeroSectionController.getListHeroSection);
router.post(
  "/upload/hero-sections",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  HeroSectionController.createHeroSection
);
router.put(
  "/upload/hero-sections/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  HeroSectionController.updateHeroSection
);
router.delete(
  "/upload/hero-sections/:id",
  rateLimiter,
  isAuthenticated,
  HeroSectionController.deleteHeroSection
);

module.exports = router;