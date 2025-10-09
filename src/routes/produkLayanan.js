const express = require("express");
const router = express.Router();
const { produkLayananController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateCreateProdukLayanan,
  validateUpdateProdukLayanan,
} = require("../utils/validators/produkLayanan");
const { upload } = require("../utils/uploads");

// /upload/produk-layanan
router.get(
  "/upload/produk-layanan",
  produkLayananController.getAllProdukLayanan
);
router.get(
  "/upload/produk-layanan/:identifier",
  produkLayananController.getProdukLayananByIdentifier
);
router.post(
  "/upload/produk-layanan",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCreateProdukLayanan,
  validate,
  produkLayananController.createProdukLayanan
);
router.put(
  "/upload/produk-layanan/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateUpdateProdukLayanan,
  validate,
  produkLayananController.updateProdukLayanan
);
router.delete(
  "/upload/produk-layanan/:id",
  rateLimiter,
  isAuthenticated,
  produkLayananController.deleteProdukLayanan
);

module.exports = router;
