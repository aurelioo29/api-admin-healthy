const User = require("./User");
const ActivityLog = require("./ActivityLog");
const Csr = require("./Csr");
const Article = require("./Article");
const CategoryArticle = require("./CategoryArticle");
const Catalog = require("./Catalog");
const CategoryCatalog = require("./CategoryCatalog");
const LabTest = require("./LabTest");
const CategoryLabTest = require("./CategoryLabTest");
const Testimoni = require("./Testimoni");
const LokasiKlinik = require("./lokasiKlinik");
const EventPromo = require("./EventPromo");
const LayananKlinik = require("./layananKlinik");
const LayananKlinikI18n = require("./layananKlinik_i18n");
const AboutUs = require("./aboutUs");
const AboutUsI18n = require("./aboutUs_i18n");
const AboutUsGallery = require("./aboutUs_gallery");
const AboutUsSertifikat = require("./aboutUs_sertifikat");
const AboutUsCore = require("./aboutUs_core");
const AboutUsCoreI18n = require("./aboutUs_core_i18n");
const AboutUsPresident = require("./aboutUs_president");
const AboutUsPresidentI18n = require("./aboutUs_president_i18n");
const CorporateHealth = require("./corporate_health");
const CorporateHealthI18n = require("./corporate_health_i18n");
const Dokter = require("./Dokter");
const CategoryInvestor = require("./categoryInvestor");
const Investor = require("./Investor");
const ProdukLayanan = require("./produkLayanan");
const HeroSection = require("./hero_section");
const HeroSectionI18n = require("./hero_section_i18n");
const HomeCard = require("./homeCard");

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
  Testimoni,
  LokasiKlinik,
  EventPromo,
  LayananKlinik,
  LayananKlinikI18n,
  AboutUs,
  AboutUsI18n,
  AboutUsGallery,
  AboutUsSertifikat,
  AboutUsCore,
  AboutUsCoreI18n,
  AboutUsPresident,
  AboutUsPresidentI18n,
  CorporateHealth,
  CorporateHealthI18n,
  Dokter,
  CategoryInvestor,
  Investor,
  ProdukLayanan,
  HeroSection,
  HeroSectionI18n,
  HomeCard,
};
