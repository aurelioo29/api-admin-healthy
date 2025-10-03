const { check } = require("express-validator");

const validateLokasiKlinikPost = [
  check("title").trim().notEmpty().withMessage("Title is required"),
  check("address").trim().notEmpty().withMessage("Address is required"),
  check("phone").trim().notEmpty().withMessage("Phone is required"),
  check("operational")
    .trim()
    .notEmpty()
    .withMessage("Operational hours are required"),
  check("type_service")
    .trim()
    .notEmpty()
    .withMessage("Type of service is required"),
  check("link_map").trim().isURL().withMessage("Link map must be a valid URL"),
  check("wa_number")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
  check("jenis")
    .trim()
    .isIn(["Laboratorium_Utama", "Klinik", "Mitra_Jaringan"])
    .withMessage(
      "Jenis must be one of Laboratorium_Utama, Klinik, or Mitra_Jaringan"
    ),
];

const validateLokasiKlinikUpdate = [
  check("title").trim().notEmpty().withMessage("Title is required"),
  check("address").trim().notEmpty().withMessage("Address is required"),
  check("phone").trim().notEmpty().withMessage("Phone is required"),
  check("operational")
    .trim()
    .notEmpty()
    .withMessage("Operational hours are required"),
  check("type_service")
    .trim()
    .notEmpty()
    .withMessage("Type of service is required"),
  check("link_map").trim().isURL().withMessage("Link map must be a valid URL"),
  check("wa_number")
    .trim()
    .notEmpty()
    .withMessage("WhatsApp number is required"),
  check("jenis")
    .trim()
    .isIn(["Laboratorium_Utama", "Klinik", "Mitra_Jaringan"])
    .withMessage(
      "Jenis must be one of Laboratorium_Utama, Klinik, or Mitra_Jaringan"
    ),
];

module.exports = { validateLokasiKlinikPost, validateLokasiKlinikUpdate };
