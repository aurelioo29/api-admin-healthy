const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const CategoryInvestor = require("./categoryInvestor");

const Investor = sequelize.define(
  "Investor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    file: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "category_investors", key: "id" },
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
    tableName: "investors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Investor.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(Investor, { foreignKey: "author_id" });

Investor.belongsTo(CategoryInvestor, {
  foreignKey: "category_id",
  as: "category",
});
CategoryInvestor.hasMany(Investor, { foreignKey: "category_id" });

module.exports = Investor;
