const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const LayananKlinik = sequelize.define(
  "LayananKlinik",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    section_key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: "section_key",
    },
    image: { type: DataTypes.STRING, allowNull: true },
    position: {
      type: DataTypes.ENUM("left", "right"),
      allowNull: false,
      defaultValue: "left",
    },
    order_no: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
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
    tableName: "layanan_klinik",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

LayananKlinik.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(LayananKlinik, { foreignKey: "author_id", as: "layanan_klinik" });

module.exports = LayananKlinik;
