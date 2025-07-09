const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: DataTypes.STRING,
    nama: DataTypes.STRING,
    nip: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    foto_profil: {
      type: DataTypes.STRING,
    },
    role: {
      type: DataTypes.ENUM("admin", "mahasiswa"),
      defaultValue: "mahasiswa",
    },
    stase: {
      type: DataTypes.ENUM(
        "penyakit_dalam",
        "kulit_kelamin",
        "radiologi",
        "paru",
        "anak",
        "sikiatri",
        "neurologi",
        "forensik",
        "bedah",
        "ortopedi",
        "tht",
        "obgyn",
        "mata",
        "anestesi"
      ),
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);

module.exports = User;
