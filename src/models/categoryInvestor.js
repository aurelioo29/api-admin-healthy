const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const CategoryInvestor = sequelize.define(
  "CategoryInvestor",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    slug: { type: DataTypes.STRING, allowNull: false, unique: true },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "category_investors",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

CategoryInvestor.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(CategoryInvestor, {
  foreignKey: "author_id",
  as: "investorCategories",
});

module.exports = CategoryInvestor;
