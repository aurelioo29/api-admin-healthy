const authController = require("./auth");
const csrController = require("./csr");
const articleController = require("./article");
const categoryArticleController = require("./categoryArticle");
const activityLogController = require("./activityLog");
const labTestController = require("./labTest");
const categoryLabTestController = require("./categoryLabTest");
const catalogController = require("./catalog");
const categoryCatalogController = require("./categoryCatalog");

module.exports = {
  authController,
  csrController,
  articleController,
  categoryArticleController,
  activityLogController,
  labTestController,
  categoryLabTestController,
  catalogController,
  categoryCatalogController,
};
