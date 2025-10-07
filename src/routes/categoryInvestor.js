const express = require("express");
const router = express.Router();
const { categoryInvestorController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get(
  "/upload/category-investors",
  categoryInvestorController.getAllCategoryInvestors
);
router.get(
  "/uploads/category-investors/:identifier",
  categoryInvestorController.getCategoryInvestorByIdentifier
);
router.post(
  "/upload/category-investors",
  rateLimiter,
  isAuthenticated,
  categoryInvestorController.createCategoryInvestor
);
router.put(
  "/upload/category-investors/:id",
  rateLimiter,
  isAuthenticated,
  categoryInvestorController.updateCategoryInvestor
);
router.delete(
  "/upload/category-investors/:id",
  rateLimiter,
  isAuthenticated,
  categoryInvestorController.deleteCategoryInvestor
);

module.exports = router;
