const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const AboutUsGallery = sequelize.define(
  "AboutUsGallery",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    image: { type: DataTypes.STRING, allowNull: true },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
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
    tableName: "about_us_gallery",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Associations
AboutUsGallery.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(AboutUsGallery, { foreignKey: "author_id" });

module.exports = AboutUsGallery;
