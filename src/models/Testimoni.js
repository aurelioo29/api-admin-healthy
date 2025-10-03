const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Testimoni = sequelize.define(
  "Testimoni",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    job: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link_video: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
    tableName: "testimonis",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

Testimoni.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(Testimoni, { foreignKey: "author_id", as: "testimonis" });

module.exports = Testimoni;
