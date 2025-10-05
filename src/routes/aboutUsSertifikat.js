const express = require("express");
const router = express.Router();
const { aboutUsSertifikatController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get(
  "/upload/about-us-sertifikat",
  aboutUsSertifikatController.getAllAboutUsSertifikat
);
router.get(
  "/uploads/about-us-sertifikat/:identifier",
  aboutUsSertifikatController.getAboutUsSertifikatByIdentifier
);
router.post(
  "/upload/about-us-sertifikat",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsSertifikatController.createAboutUsSertifikat
);
router.put(
  "/upload/about-us-sertifikat/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsSertifikatController.updateAboutUsSertifikat
);
router.delete(
  "/upload/about-us-sertifikat/:id",
  rateLimiter,
  isAuthenticated,
  aboutUsSertifikatController.deleteAboutUsSertifikat
);

module.exports = router;
