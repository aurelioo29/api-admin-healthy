const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const CategoryCatalog = sequelize.define(
  "CategoryCatalog",
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
    tableName: "category_catalogs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CategoryCatalog.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(CategoryCatalog, { foreignKey: "author_id", as: "catalogCategories" });

module.exports = CategoryCatalog;
