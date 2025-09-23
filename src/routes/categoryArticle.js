const express = require("express");
const router = express.Router();
const categoryArticleController = require("../controllers/categoryArticle");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateCategoryArticlePost,
  validateCategoryArticleUpdate,
} = require("../utils/validators/categoryArticle");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get(
  "/category-articles",
  isAuthenticated,
  categoryArticleController.getAllCategoryArticles
);
router.get(
  "/category-articles/:identifier",
  isAuthenticated,
  categoryArticleController.getCategoryArticleByIdentifier
);
router.post(
  "/category-articles",
  rateLimiter,
  isAuthenticated,
  validateCategoryArticlePost,
  validate,
  categoryArticleController.createCategoryArticle
);
router.put(
  "/category-articles/:id",
  rateLimiter,
  isAuthenticated,
  validateCategoryArticleUpdate,
  validate,
  categoryArticleController.updateCategoryArticle
);
router.delete(
  "/category-articles/:id",
  rateLimiter,
  isAuthenticated,
  categoryArticleController.deleteCategoryArticle
);

module.exports = router;
