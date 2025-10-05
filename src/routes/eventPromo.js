const express = require("express");
const router = express.Router();
const { eventPromoController } = require("../controllers");
const rateLimiter = require("../middlewares/rateLimiter");
const validate = require("../utils/validators/validate");
const {
  validateEventPromoPost,
  validateEventPromoUpdate,
} = require("../utils/validators/eventPromo");
const isAuthenticated = require("../middlewares/isAuthenticated");
const { upload } = require("../utils/uploads");

router.get("/upload/event-promos", eventPromoController.getAllEventPromos);
router.get(
  "/uploads/event-promos/:identifier",
  eventPromoController.getEventPromosByIdentifier
);
router.post(
  "/upload/event-promos",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateEventPromoPost,
  validate,
  eventPromoController.createEventPromo
);
router.put(
  "/upload/event-promos/:id",
  rateLimiter,
  isAuthenticated,
  upload.single("image"),
  validateEventPromoUpdate,
  validate,
  eventPromoController.updateEventPromo
);
router.delete(
  "/upload/event-promos/:id",
  rateLimiter,
  isAuthenticated,
  eventPromoController.deleteEventPromo
);

module.exports = router;
