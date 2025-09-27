const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const CategoryArticle = require("./CategoryArticle");

const Article = sequelize.define(
  "Article",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "category_articles", key: "id" },
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
    tableName: "articles",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
Article.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(Article, { foreignKey: "author_id" });

Article.belongsTo(CategoryArticle, {
  foreignKey: "category_id",
  as: "category",
});
CategoryArticle.hasMany(Article, { foreignKey: "category_id" });

module.exports = Article;
