const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AboutUsPresident = require("./aboutUs_president");

const AboutUsPresidentI18n = sequelize.define(
  "AboutUsPresidentI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: AboutUsPresident, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "about_us_president_i18n",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["section_id", "locale"],
      },
    ],
  }
);

AboutUsPresident.hasMany(AboutUsPresidentI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
AboutUsPresidentI18n.belongsTo(AboutUsPresident, {
  foreignKey: "section_id",
  as: "section",
});

module.exports = AboutUsPresidentI18n;
