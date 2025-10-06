const express = require("express");
const router = express.Router();
const { corporateHealthController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get(
  "/upload/corporate-health",
  corporateHealthController.getListCorporateHealth
);
router.post(
  "/upload/corporate-health",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  corporateHealthController.createCorporateHealth
);
router.put(
  "/upload/corporate-health/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  corporateHealthController.updateCorporateHealth
);
router.delete(
  "/upload/corporate-health/:id",
  rateLimiter,
  isAuthenticated,
  corporateHealthController.deleteCorporateHealth
);
module.exports = router;
