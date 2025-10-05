const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AboutUs = require("./aboutUs");

const AboutUsI18n = sequelize.define(
  "AboutUsI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: AboutUs, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "about_us_i18n",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["section_id", "locale"],
      },
    ],
  }
);

AboutUs.hasMany(AboutUsI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
AboutUsI18n.belongsTo(AboutUs, { foreignKey: "section_id", as: "section" });

module.exports = AboutUsI18n;
