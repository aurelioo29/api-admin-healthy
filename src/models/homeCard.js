const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const HomeCard = sequelize.define(
  "HomeCard",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "published"),
      defaultValue: "draft",
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
    tableName: "home_cards",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

HomeCard.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(HomeCard, { foreignKey: "author_id", as: "homeCards" });

module.exports = HomeCard;
