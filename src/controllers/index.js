const authController = require("./auth");
const csrController = require("./csr");
const articleController = require("./article");
const categoryArticleController = require("./CategoryArticle");
const activityLogController = require("./activityLog");
const labTestController = require("./labTest");
const categoryLabTestController = require("./categoryLabTest");

module.exports = {
  authController,
  csrController,
  articleController,
  categoryArticleController,
  activityLogController,
  labTestController,
  categoryLabTestController,
};
