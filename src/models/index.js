const User = require("./User");
const ActivityLog = require("./ActivityLog");
const Csr = require("./Csr");
const Article = require("./Article");
const CategoryArticle = require("./CategoryArticle");

User.hasMany(Csr, { foreignKey: "author_id" });
Csr.belongsTo(User, { foreignKey: "author_id" });

module.exports = {
  User,
  ActivityLog,
  Csr,
  Article,
  CategoryArticle,
};
