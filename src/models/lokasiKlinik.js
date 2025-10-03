const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const LOKASI_KLINIK = ["Laboratorium_Utama", "Klinik", "Mitra_Jaringan"];

const LokasiKlinik = sequelize.define(
  "LokasiKlinik",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    operational: { type: DataTypes.TEXT, allowNull: true },
    type_service: { type: DataTypes.TEXT, allowNull: true },
    link_map: { type: DataTypes.STRING(512), allowNull: true },
    wa_number: { type: DataTypes.STRING(32), allowNull: true },
    jenis: {
      type: DataTypes.ENUM(...LOKASI_KLINIK),
      allowNull: false,
      defaultValue: "Klinik",
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users", key: "id" },
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "lokasi_klinik",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

LokasiKlinik.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(LokasiKlinik, { foreignKey: "author_id", as: "lokasiKliniks" });

LokasiKlinik.JENIS = LOKASI_KLINIK;

module.exports = LokasiKlinik;
