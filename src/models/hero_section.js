const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const HeroSection = sequelize.define(
  "HeroSection",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    page_key: {
      type: DataTypes.ENUM(
        "home",
        "about",
        "lab_tests",
        "consultation",
        "clinic_services",
        "corporate_health_service",
        "e_catalog",
        "csr",
        "articles",
        "investor_relations",
        "location"
      ),
      allowNull: false,
      unique: true,
    },
    position: {
      type: DataTypes.ENUM("left", "right"),
      allowNull: false,
      defaultValue: "left",
    },
    image: { type: DataTypes.STRING, allowNull: true },
    image_alt: { type: DataTypes.STRING, allowNull: true },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "hero_sections",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

HeroSection.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(HeroSection, { foreignKey: "author_id", as: "hero_sections" });

module.exports = HeroSection;
