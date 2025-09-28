const express = require("express");
const router = express.Router();
const { labTestController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateLabTestPost,
  validateLabTestUpdate,
} = require("../utils/validators/labTest");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/upload/lab-tests", labTestController.getAllLabTests);
router.get(
  "/upload/lab-tests/:identifier",
  labTestController.getLabTestByIdentifier
);
router.post(
  "/upload/lab-tests",
  rateLimiter,
  isAuthenticated,
  validateLabTestPost,
  validate,
  labTestController.createLabTest
);
router.put(
  "/upload/lab-tests/:id",
  rateLimiter,
  isAuthenticated,
  validateLabTestUpdate,
  validate,
  labTestController.updateLabTest
);
router.delete(
  "/upload/lab-tests/:id",
  rateLimiter,
  isAuthenticated,
  labTestController.deleteLabTest
);

module.exports = router;
