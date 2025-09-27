const { Op, col, where } = require("sequelize");
const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");

const parseYMD = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)); 
};

const getActivityLogs = async (req, res, next) => {
  try {
    const {
      page,
      size,
      search,
      userId,
      action,
      resource,
      date_from,
      date_to,
      sortBy,
      sortDir,
    } = req.query;

    const limit = Math.min(parseInt(size, 10) || 10, 100);
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (currentPage - 1) * limit;

    // WHERE
    const whereCond = {};

    // filter by user
    if (userId) whereCond.user_id = parseInt(userId, 10);

    // filter by action/resource (LIKE biar fleksibel)
    if (action) whereCond.action = { [Op.like]: `%${action}%` };
    if (resource) whereCond.resource = { [Op.like]: `%${resource}%` };

    // date range (created_at)
    const from = parseYMD(date_from);
    const to = parseYMD(date_to);
    if (from || to) {
      whereCond.created_at = {};
      if (from) whereCond.created_at[Op.gte] = from;
      if (to) {
        // exclusive upper bound: next day 00:00 UTC
        const toExclusive = new Date(to.getTime() + 24 * 60 * 60 * 1000);
        whereCond.created_at[Op.lt] = toExclusive;
      }
    }

    // search across description, resource, action, and username
    const s = (search || "").trim();
    const searchOr = [];
    if (s) {
      searchOr.push(
        { description: { [Op.like]: `%${s}%` } },
        { action: { [Op.like]: `%${s}%` } },
        { resource: { [Op.like]: `%${s}%` } },
        // search by username (User.username)
        where(col("User.username"), { [Op.like]: `%${s}%` })
      );
    }
    if (searchOr.length) {
      whereCond[Op.and] = whereCond[Op.and] || [];
      whereCond[Op.and].push({ [Op.or]: searchOr });
    }

    // sorting
    const sortable = new Set(["created_at", "user_id", "action", "resource"]);
    const orderBy = sortable.has(String(sortBy))
      ? String(sortBy)
      : "created_at";
    const direction = String(sortDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

    const { count: totalLogs, rows: logs } = await ActivityLog.findAndCountAll({
      where: whereCond,
      include: [{ model: User, attributes: ["id", "username", "email"] }],
      order: [[orderBy, direction]],
      limit,
      offset,
      distinct: true,
      subQuery: false,
    });

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "No activity logs found",
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Activity logs retrieved successfully",
      data: {
        logs,
        totalLogs,
        totalPages: Math.max(Math.ceil(totalLogs / limit), 1),
        currentPage,
      },
    });
  } catch (error) {
    console.error(
      "getActivityLogs error:",
      error?.parent?.sqlMessage || error.message
    );
    next(error);
  }
};

const getActivityLogById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);

    const log = await ActivityLog.findOne({
      where: { id },
      include: [{ model: User, attributes: ["id", "username", "email"] }],
    });

    if (!log) {
      return res.status(404).json({
        code: 404,
        success: false,
        message: "Activity log not found",
      });
    }

    return res.status(200).json({
      code: 200,
      success: true,
      message: "Activity log retrieved successfully",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActivityLogs,
  getActivityLogById,
};
