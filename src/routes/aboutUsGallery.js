const express = require("express");
const router = express.Router();
const { aboutUsGalleryController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get(
  "/upload/about-us-gallery",
  aboutUsGalleryController.getAllAboutUsGallery
);
router.get(
  "/uploads/about-us-gallery/:identifier",
  aboutUsGalleryController.getAboutUsGalleryByIdentifier
);
router.post(
  "/upload/about-us-gallery",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsGalleryController.createAboutUsGallery
);
router.put(
  "/upload/about-us-gallery/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsGalleryController.updateAboutUsGallery
);
router.delete(
  "/upload/about-us-gallery/:id",
  rateLimiter,
  isAuthenticated,
  aboutUsGalleryController.deleteAboutUsGallery
);

module.exports = router;
