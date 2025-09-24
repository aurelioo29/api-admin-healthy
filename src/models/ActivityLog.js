const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const ActivityLog = sequelize.define(
  "ActivityLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "activity_logs",
    timestamps: false,
  }
);

// Relasi
ActivityLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(ActivityLog, { foreignKey: "user_id" });

module.exports = ActivityLog;
