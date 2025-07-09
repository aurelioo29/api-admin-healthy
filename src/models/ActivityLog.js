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
    aktivitas: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endpoint: {
      type: DataTypes.STRING,
      allowNull: false,
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
