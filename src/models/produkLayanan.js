const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const ProdukLayanan = sequelize.define(
  "ProdukLayanan",
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    target_link: {
      type: DataTypes.STRING(255),
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
    tableName: "produk_layanans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

ProdukLayanan.belongsTo(User, { foreignKey: "author_id", as: "author" });
User.hasMany(ProdukLayanan, { foreignKey: "author_id", as: "produk_layanans" });

module.exports = ProdukLayanan;
