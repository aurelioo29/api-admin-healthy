const express = require("express");
const authRoutes = require("./auth");
const csrRoutes = require("./csr");
const articleRoutes = require("./article");
const categoryArticleRoutes = require("./categoryArticle");
const activityLogRoutes = require("./activityLog");
const labTestRoutes = require("./labTest");
const categoryLabTestRoutes = require("./categoryLabTest");
const catalogRoutes = require("./catalog");
const categoryCatalogRoutes = require("./categoryCatalog");
const testimoniRoutes = require("./testimoni");
const lokasiKlinikRoutes = require("./lokasiKlinik");

const router = express.Router();

// Basic route to check if the API is running
router.get("/", (request, response) => {
  response.status(200).json({
    code: 200,
    success: true,
    message: "Welcome to the API Admin Healthy v1",
  });
});

module.exports = {
  authRoutes,
  router,
  csrRoutes,
  articleRoutes,
  categoryArticleRoutes,
  activityLogRoutes,
  labTestRoutes,
  categoryLabTestRoutes,
  catalogRoutes,
  categoryCatalogRoutes,
  testimoniRoutes,
  lokasiKlinikRoutes,
};
