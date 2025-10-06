const express = require("express");
const router = express.Router();
const { aboutUsPresidentController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get(
  "/upload/about-us-president",
  aboutUsPresidentController.getListAboutUsPresident
);
router.post(
  "/upload/about-us-president",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsPresidentController.createAboutUsPresident
);
router.put(
  "/upload/about-us-president/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  aboutUsPresidentController.updateAboutUsPresident
);
router.delete(
  "/upload/about-us-president/:id",
  rateLimiter,
  isAuthenticated,
  aboutUsPresidentController.deleteAboutUsPresident
);
module.exports = router;