const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const AboutUsCore = require("./aboutUs_core");

const AboutUsCoreI18n = sequelize.define(
  "AboutUsCoreI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: AboutUsCore, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "about_us_core_i18n",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["section_id", "locale"],
      },
    ],
  }
);

AboutUsCore.hasMany(AboutUsCoreI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
AboutUsCoreI18n.belongsTo(AboutUsCore, {
  foreignKey: "section_id",
  as: "section",
});

module.exports = AboutUsCoreI18n;
