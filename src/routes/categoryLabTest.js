const express = require("express");
const router = express.Router();
const { categoryLabTestController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateLabTestCategoryPost,
  validateLabTestCategoryUpdate,
} = require("../utils/validators/categoryLabTest");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

// list
router.get(
  "/upload/category-lab-tests",
  categoryLabTestController.getAllCategoryLabTests
);

// detail by slug or id
router.get(
  "/upload/category-lab-tests/:identifier",
  categoryLabTestController.getCategoryLabTestByIdentifier
);

// create (multipart)
router.post(
  "/upload/category-lab-tests",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateLabTestCategoryPost,
  validate,
  categoryLabTestController.createCategoryLabTest
);

// update (multipart optional)
router.put(
  "/upload/category-lab-tests/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateLabTestCategoryUpdate,
  validate,
  categoryLabTestController.updateCategoryLabTest
);

// delete
router.delete(
  "/upload/category-lab-tests/:id",
  rateLimiter,
  isAuthenticated,
  categoryLabTestController.deleteCategoryLabTest
);

module.exports = router;
