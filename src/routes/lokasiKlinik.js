const express = require("express");
const router = express.Router();
const { lokasiKlinikController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateLokasiKlinikPost,
  validateLokasiKlinikUpdate,
} = require("../utils/validators/lokasiKlinik");
const { upload } = require("../utils/uploads");

router.get("/upload/lokasi-klinik", lokasiKlinikController.getAllLokasiKlinik);
router.get(
  "/upload/lokasi-klinik/:identifier",
  lokasiKlinikController.getLokasiKlinikByIdentifier
);
router.post(
  "/upload/lokasi-klinik",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateLokasiKlinikPost,
  validate,
  lokasiKlinikController.createLokasiKlinik
);
router.put(
  "/upload/lokasi-klinik/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateLokasiKlinikUpdate,
  validate,
  lokasiKlinikController.updateLokasiKlinik
);
router.delete(
  "/upload/lokasi-klinik/:id",
  rateLimiter,
  isAuthenticated,
  lokasiKlinikController.deleteLokasiKlinik
);

module.exports = router;
