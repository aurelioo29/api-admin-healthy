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
      type: DataTypes.ENUM("admin", "superadmin", "developer"),
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
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",

    // SOFT DELETE
    paranoid: true,
    deletedAt: "deleted_at",

    underscored: true,
    indexes: [
      { unique: true, fields: ["username", "deleted_at"] },
      { unique: true, fields: ["email", "deleted_at"] },
    ],
  }
);

module.exports = User;
