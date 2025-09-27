const express = require("express");
const router = express.Router();
const { articleController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validate = require("../utils/validators/validate");
const {
  validateArticlePost,
  validateArticleUpdate,
} = require("../utils/validators/article");
const { upload } = require("../utils/uploads");

// list
router.get(
  "/upload/articles",
  isAuthenticated,
  articleController.getAllArticles
);

// detail by slug or id
router.get(
  "/upload/articles/:identifier",
  articleController.getArticleByIdentifier
);

// create (multipart)
router.post(
  "/upload/articles",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateArticlePost,
  validate,
  articleController.createArticle
);

// update (multipart optional)
router.put(
  "/upload/articles/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateArticleUpdate,
  validate,
  articleController.updateArticle
);

// delete
router.delete(
  "/upload/articles/:id",
  rateLimiter,
  isAuthenticated,
  articleController.deleteArticle
);

module.exports = router;
