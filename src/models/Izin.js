const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Izin = sequelize.define(
  "Izin",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tanggal_mulai: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tanggal_selesai: DataTypes.DATE,
    alasan: DataTypes.STRING,
    file: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("pending", "setuju", "tolak"),
      defaultValue: "pending",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: DataTypes.DATE,
  },
  {
    tableName: "izin",
    timestamps: false,
  }
);

Izin.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(Izin, { foreignKey: "user_id" });

module.exports = Izin;
