const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const CategoryLabTest = sequelize.define(
  "CategoryLabTest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: { type: DataTypes.TEXT, allowNull: true },
    image: { type: DataTypes.STRING, allowNull: true },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "category_lab_tests",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CategoryLabTest.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(CategoryLabTest, {
  foreignKey: "author_id",
  as: "labTestCategories",
});

module.exports = CategoryLabTest;
