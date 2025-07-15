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
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM("admin", "mahasiswa"),
      defaultValue: "mahasiswa",
      allowNull: false,
    },
    name: DataTypes.STRING,
    nip: {
      type: DataTypes.INTEGER,
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
    forgotPasswordCodeExpires: {
      type: DataTypes.INTEGER,
    },
    forgotPasswordRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
    indexes: [
      {
        unique: true,
        fields: ["username", "email", "nip"],
      },
    ],
  }
);

module.exports = User;
