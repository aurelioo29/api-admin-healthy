const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const HeroSection = require("./hero_section");

const HeroSectionI18n = sequelize.define(
  "HeroSectionI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: HeroSection, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
    cta_text: { type: DataTypes.STRING(100), allowNull: true },
    cta_link: { type: DataTypes.STRING(255), allowNull: true },
  },
  {
    tableName: "hero_section_i18n",
    timestamps: false,
    indexes: [{ unique: true, fields: ["section_id", "locale"] }],
  }
);

HeroSection.hasMany(HeroSectionI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
HeroSectionI18n.belongsTo(HeroSection, {
  foreignKey: "section_id",
  as: "section",
});

module.exports = HeroSectionI18n;
