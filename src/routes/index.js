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
const eventPromoRoutes = require("./eventPromo");
const aboutUsRoutes = require("./aboutUs");
const layananKlinikRoutes = require("./layananKlinik");
const aboutUsGalleryRoutes = require("./aboutUsGallery");
const aboutUsSertifikatRoutes = require("./aboutUsSertifikat");
const aboutUsPresidentRoutes = require("./aboutUsPresident");
const aboutUsCoreRoutes = require("./aboutUsCore");
const corporateHealthRoutes = require("./corporateHealth");
const dokterRoutes = require("./dokter");
const categoryInvestorRoutes = require("./categoryInvestor");
const investorRoutes = require("./investor");
const produkLayananRoutes = require("./produkLayanan");
const heroSectionRoutes = require("./heroSection");

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
  eventPromoRoutes,
  aboutUsRoutes,
  layananKlinikRoutes,
  aboutUsGalleryRoutes,
  aboutUsSertifikatRoutes,
  aboutUsPresidentRoutes,
  aboutUsCoreRoutes,
  corporateHealthRoutes,
  dokterRoutes,
  categoryInvestorRoutes,
  investorRoutes,
  produkLayananRoutes,
  heroSectionRoutes,
};
