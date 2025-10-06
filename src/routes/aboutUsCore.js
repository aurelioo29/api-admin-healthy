const express = require("express");
const router = express.Router();
const { aboutUsCoreController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/about-us-core", aboutUsCoreController.getListAboutUsCore);
router.post(
  "/upload/about-us-core",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsCoreController.createAboutUsCore
);
router.put(
  "/upload/about-us-core/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsCoreController.updateAboutUsCore
);
router.delete(
  "/upload/about-us-core/:id",
  rateLimiter,
  isAuthenticated,
  aboutUsCoreController.deleteAboutUsCore
);

module.exports = router;
