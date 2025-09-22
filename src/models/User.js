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
      type: DataTypes.ENUM("admin", "superadmin"),
      defaultValue: "admin",
      allowNull: false,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationCode: {
      type: DataTypes.STRING,
    },
    verificationCodeExpires: {
      type: DataTypes.INTEGER,
    },
    verificationCodeRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
      { unique: true, fields: ["username"] },
      { unique: true, fields: ["email"] },
    ],
  }
);

module.exports = User;
