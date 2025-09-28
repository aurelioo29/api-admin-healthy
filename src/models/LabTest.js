const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const CategoryLabTest = require("./CategoryLabTest");

const LabTest = sequelize.define(
  "LabTest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "category_lab_tests", key: "id" },
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "lab_tests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
LabTest.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(LabTest, { foreignKey: "author_id" });

LabTest.belongsTo(CategoryLabTest, {
  foreignKey: "category_id",
  as: "category",
});
CategoryLabTest.hasMany(LabTest, { foreignKey: "category_id" });

module.exports = LabTest;
