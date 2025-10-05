const express = require("express");
const router = express.Router();
const { layananKlinikController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get(
  "/upload/layanan-klinik",
  layananKlinikController.getAllLayananKlinik
);
router.post(
  "/upload/layanan-klinik",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  layananKlinikController.createLayananKlinik
);
router.put(
  "/upload/layanan-klinik/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  layananKlinikController.updateLayananKlinik
);
router.delete(
  "/upload/layanan-klinik/:id",
  rateLimiter,
  isAuthenticated,
  layananKlinikController.deleteLayananKlinik
);

module.exports = router;
