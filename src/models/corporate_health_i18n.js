const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const CorporateHealth = require("./corporate_health");

const CorporateHealthI18n = sequelize.define(
  "CorporateHealthI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: CorporateHealth, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "corporate_health_i18n",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["section_id", "locale"],
      },
    ],
  }
);

CorporateHealth.hasMany(CorporateHealthI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
CorporateHealthI18n.belongsTo(CorporateHealth, {
  foreignKey: "section_id",
  as: "section",
});

module.exports = CorporateHealthI18n;
