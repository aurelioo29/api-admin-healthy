const User = require("./User");
const ActivityLog = require("./ActivityLog");
const Csr = require("./Csr");
const Article = require("./Article");
const CategoryArticle = require("./CategoryArticle");
const Catalog = require("./Catalog");
const CategoryCatalog = require("./CategoryCatalog");
const LabTest = require("./LabTest");
const CategoryLabTest = require("./CategoryLabTest");

// Define associations
User.hasMany(Csr, { foreignKey: "author_id" });
Csr.belongsTo(User, { foreignKey: "author_id" });

module.exports = {
  User,
  ActivityLog,
  Csr,
  Article,
  CategoryArticle,
  Catalog,
  CategoryCatalog,
  LabTest,
  CategoryLabTest,
};
