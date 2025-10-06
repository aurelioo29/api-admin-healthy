const express = require("express");
const router = express.Router();
const { dokterController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateCreateDokterValidator,
  validateUpdateDokterValidator,
} = require("../utils/validators/dokter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/dokters", dokterController.getAllDokters);
router.get(
  "/uploads/dokters/:identifier",
  dokterController.getDokterByIdentifier
);
router.post(
  "/upload/dokters",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCreateDokterValidator,
  validate,
  dokterController.createDokter
);
router.put(
  "/upload/dokters/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateUpdateDokterValidator,
  validate,
  dokterController.updateDokter
);
router.delete(
  "/upload/dokters/:id",
  rateLimiter,
  isAuthenticated,
  dokterController.deleteDokter
);

module.exports = router;
