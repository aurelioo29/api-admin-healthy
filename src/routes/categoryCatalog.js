const express = require("express");
const router = express.Router();
const { categoryCatalogController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateCatalogCategoryPost,
  validateCatalogCategoryUpdate,
} = require("../utils/validators/categoryCatalog");

router.get(
  "/upload/category-catalogs",
  categoryCatalogController.getAllCategoryCatalogs
);
router.get(
  "/upload/category-catalogs/:identifier",
  categoryCatalogController.getCategoryCatalogByIdentifier
);
router.post(
  "/upload/category-catalogs",
  rateLimiter,
  isAuthenticated,
  validateCatalogCategoryPost,
  validate,
  categoryCatalogController.createCategoryCatalog
);
router.put(
  "/upload/category-catalogs/:id",
  rateLimiter,
  isAuthenticated,
  validateCatalogCategoryUpdate,
  validate,
  categoryCatalogController.updateCategoryCatalog
);
router.delete(
  "/upload/category-catalogs/:id",
  rateLimiter,
  isAuthenticated,
  categoryCatalogController.deleteCategoryCatalog
);

module.exports = router;
