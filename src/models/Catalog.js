const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const CategoryCatalog = require("./CategoryCatalog");

const Catalog = sequelize.define(
  "Catalog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    price_original: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    price_discount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: "IDR",
    },
    wa_text: { type: DataTypes.STRING(300), allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "category_catalogs", key: "id" },
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
    tableName: "catalogs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
Catalog.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(Catalog, { foreignKey: "author_id" });

Catalog.belongsTo(CategoryCatalog, {
  foreignKey: "category_id",
  as: "category",
});
CategoryCatalog.hasMany(Catalog, { foreignKey: "category_id" });

module.exports = Catalog;
