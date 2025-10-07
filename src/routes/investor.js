const express = require("express");
const router = express.Router();
const { investorController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { uploadPdf } = require("../utils/uploads");

router.get("/upload/investors", investorController.getAllInvestors);
router.get(
  "/uploads/investors/:identifier",
  investorController.getInvestorByIdentifier
);
router.post(
  "/upload/investors",
  isAuthenticated,
  rateLimiter,
  uploadPdf.single("file"),
  investorController.createInvestor
);
router.put(
  "/upload/investors/:id",
  isAuthenticated,
  rateLimiter,
  uploadPdf.single("file"),
  investorController.updateInvestor
);
router.delete(
  "/upload/investors/:id",
  isAuthenticated,
  rateLimiter,
  investorController.deleteInvestor
);
router.get(
  "/upload/investors/:identifier/download",
  investorController.downloadInvestorFile
);

module.exports = router;