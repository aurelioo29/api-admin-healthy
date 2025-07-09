const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Absence = sequelize.define(
  "Absence",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tanggal: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    jam_masuk: DataTypes.DATE,
    latitude_masuk: DataTypes.DECIMAL,
    longitude_masuk: DataTypes.DECIMAL,
    jam_keluar: DataTypes.DATE,
    latitude_keluar: DataTypes.DECIMAL,
    longitude_keluar: DataTypes.DECIMAL,
    status: {
      type: DataTypes.ENUM("hadir", "terlambat", "izin", "alpha"),
      defaultValue: "hadir",
    },
    keterangan: DataTypes.STRING,
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "absences",
    timestamps: false,
  }
);

Absence.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Absence, { foreignKey: "user_id" });

module.exports = Absence;
