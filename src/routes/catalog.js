const express = require("express");
const router = express.Router();
const { catalogController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateCatalogPost,
  validateCatalogUpdate,
} = require("../utils/validators/catalog");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

// LIST (public)
router.get("/upload/catalogs", catalogController.getAllCatalogs);

// DETAIL by slug/id
router.get(
  "/upload/catalogs/:identifier",
  catalogController.getCatalogByIdentifier
);

// CREATE (multipart/form-data)
router.post(
  "/upload/catalogs",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCatalogPost,
  validate,
  catalogController.createCatalog
);

// UPDATE (multipart/form-data optional)
router.put(
  "/upload/catalogs/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateCatalogUpdate,
  validate,
  catalogController.updateCatalog
);

// DELETE
router.delete(
  "/upload/catalogs/:id",
  rateLimiter,
  isAuthenticated,
  catalogController.deleteCatalog
);

module.exports = router;
