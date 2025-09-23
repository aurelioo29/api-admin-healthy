const ActivityLog = require("../models/ActivityLog");

const logActivity = async ({
  userId = null,
  action,
  resource = null,
  resourceId = null,
  description = "",
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      action,
      resource,
      resource_id: resourceId,
      description,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    console.error("❌ Failed to log activity:", err.message);
  }
};

module.exports = logActivity;
