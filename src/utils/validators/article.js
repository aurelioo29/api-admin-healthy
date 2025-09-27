const { body } = require("express-validator");
const CategoryArticle = require("../../models/CategoryArticle");

const mustExistCategory = body("category_id")
  .notEmpty()
  .withMessage("category_id is required")
  .bail()
  .isInt({ gt: 0 })
  .withMessage("category_id must be a positive integer")
  .bail()
  .custom(async (val) => {
    const cat = await CategoryArticle.findByPk(val);
    if (!cat) throw new Error("category_id does not exist");
    return true;
  });

const validateArticlePost = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("date")
    .notEmpty()
    .withMessage("Date is required")
    .bail()
    .isISO8601()
    .withMessage("Date must be ISO format (YYYY-MM-DD)"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be 'draft' or 'published'"),
  mustExistCategory,
];

const validateArticleUpdate = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
  body("date")
    .optional()
    .isISO8601()
    .withMessage("Date must be ISO format (YYYY-MM-DD)"),
  body("status")
    .optional()
    .isIn(["draft", "published"])
    .withMessage("Status must be 'draft' or 'published'"),
  body("category_id")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("category_id must be a positive integer")
    .bail()
    .custom(async (val) => {
      if (val == null) return true;
      const cat = await CategoryArticle.findByPk(val);
      if (!cat) throw new Error("category_id does not exist");
      return true;
    }),
];

module.exports = { validateArticlePost, validateArticleUpdate };
