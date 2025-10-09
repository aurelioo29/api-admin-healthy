const express = require("express");
const router = express.Router();
const { homeCardController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/home-card", homeCardController.getAllHomeCards);
router.post(
  "/upload/home-card",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  homeCardController.createHomeCard
);
router.get(
  "/upload/home-card/:identifier",
  homeCardController.getHomeCardByIdentifier
);
router.put(
  "/upload/home-card/:identifier",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  homeCardController.updateHomeCard
);
router.delete(
  "/upload/home-card/:id",
  rateLimiter,
  isAuthenticated,
  homeCardController.deleteHomeCard
);

module.exports = router;