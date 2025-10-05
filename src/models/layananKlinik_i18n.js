const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const LayananKlinik = require("./layananKlinik");

const LayananKlinikI18n = sequelize.define(
  "LayananKlinikI18n",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: LayananKlinik, key: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    locale: { type: DataTypes.ENUM("id", "en"), allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    subtitle: { type: DataTypes.STRING(255), allowNull: true },
    body_html: { type: DataTypes.TEXT, allowNull: true },
  },
  {
    tableName: "layanan_klinik_i18n",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["section_id", "locale"],
      },
    ],
  }
);

LayananKlinik.hasMany(LayananKlinikI18n, {
  foreignKey: "section_id",
  as: "i18n",
  onDelete: "CASCADE",
});
LayananKlinikI18n.belongsTo(LayananKlinik, {
  foreignKey: "section_id",
  as: "section",
});

module.exports = LayananKlinikI18n;
