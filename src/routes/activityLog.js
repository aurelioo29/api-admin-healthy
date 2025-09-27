const express = require("express");
const router = express.Router();

const activityLogController = require("../controllers/activityLog");
const isAuthenticated = require("../middlewares/isAuthenticated");

function requireSuperadmin(req, res, next) {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({
      code: 403,
      success: false,
      message: "Forbidden: Only superadmin can access activity logs",
    });
  }
  next();
}

router.get(
  "/activity-logs",
  isAuthenticated,
  activityLogController.getActivityLogs
);

router.get(
  "/activity-logs/:id",
  isAuthenticated,
  activityLogController.getActivityLogById
);

module.exports = router;
