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
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: { isEmail: true },
    },
    password: DataTypes.STRING,
    // 1. admin, 2. mahasiswa
    role: {
      type: DataTypes.STRING,
      defaultValue: 2,
    },
    name: DataTypes.STRING,
    nip: {
      type: DataTypes.INTEGER,
      unique: true,
    },
    profilePicture: {
      type: DataTypes.STRING,
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
    verificatonCode: {
      type: DataTypes.STRING,
    },
    forgotPasswordCode: {
      type: DataTypes.STRING,
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
