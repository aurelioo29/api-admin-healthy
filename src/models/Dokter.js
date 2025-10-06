const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Dokter = sequelize.define(
  "Dokter",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING(150), allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    specialization: { type: DataTypes.STRING(100), allowNull: false },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "dokters",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
Dokter.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(Dokter, { foreignKey: "author_id" });

module.exports = Dokter;
