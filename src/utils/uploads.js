const multer = require("multer");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const mime = require("mime-types");

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB || 5);
const MAX_PDF_MB = Number(process.env.MAX_PDF_MB || 20);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let sub = "others";
    if (/\/upload\/csr/i.test(req.originalUrl)) sub = "csr";
    else if (/\/upload\/articles/i.test(req.originalUrl)) sub = "articles";
    else if (/\/upload\/category-lab-tests/i.test(req.originalUrl))
      sub = "category-lab-tests";
    else if (/\/upload\/catalogs/i.test(req.originalUrl)) sub = "catalogs";
    else if (/\/upload\/testimonis/i.test(req.originalUrl)) sub = "testimonis";
    else if (/\/upload\/lokasi-klinik/i.test(req.originalUrl))
      sub = "lokasi-klinik";
    else if (/\/upload\/event-promos/i.test(req.originalUrl))
      sub = "event-promos";
    else if (/\/upload\/about-us/i.test(req.originalUrl)) sub = "about-us";
    else if (/\/upload\/layanan-klinik/i.test(req.originalUrl))
      sub = "layanan-klinik";
    else if (/\/upload\/about-us-gallery/i.test(req.originalUrl))
      sub = "about-us-gallery";
    else if (/\/upload\/about-us-sertifikat/i.test(req.originalUrl))
      sub = "about-us-sertifikat";
    else if (/\/upload\/about-us-president/i.test(req.originalUrl))
      sub = "about-us-president";
    else if (/\/upload\/about-us-core/i.test(req.originalUrl))
      sub = "about-us-core";
    else if (/\/upload\/corporate-health/i.test(req.originalUrl))
      sub = "corporate-health";
    else if (/\/upload\/dokters/i.test(req.originalUrl)) sub = "dokters";
    else if (/\/upload\/investors/i.test(req.originalUrl)) sub = "investors";
    else if (/\/upload\/hero-sections/i.test(req.originalUrl))
      sub = "hero-sections";
    else if (/\/upload\/produk-layanan/i.test(req.originalUrl))
      sub = "produk-layanan";
    else if (/\/upload\/home-card/i.test(req.originalUrl)) sub = "home-card";

    const dir = path.join(UPLOAD_ROOT, sub);
    ensureDir(dir);
    cb(null, dir);
  },

  filename(req, file, cb) {
    let baseSource = path.parse(file.originalname).name;

    if (/\/upload\/category-lab-tests/i.test(req.originalUrl)) {
      baseSource = req.body?.slug || req.body?.name || baseSource;
    } else if (
      /\/upload\/articles|\/upload\/csr|\/upload\/catalogs|\/upload\/testimonis|\/upload\/lokasi-klinik|\/upload\/event-promos|\/upload\/about-us(?:-gallery|-sertifikat|-president|-core)?|\/upload\/layanan-klinik|\/upload\/corporate-health|\/upload\/dokters|\/upload\/investors|\/upload\/hero-sections|\/upload\/produk-layanan|\/upload\/home-card/i.test(
        req.originalUrl
      )
    ) {
      baseSource = req.body?.slug || req.body?.title || baseSource;
    } else {
      baseSource =
        req.body?.slug || req.body?.title || req.body?.name || baseSource;
    }

    const baseSlug = slugify(baseSource, { lower: true, strict: true });
    const ts = Date.now();
    const ext =
      "." +
      (
        mime.extension(file.mimetype) ||
        path.extname(file.originalname).slice(1)
      ).toLowerCase();

    cb(null, `${baseSlug}-${ts}${ext}`);
  },
});

/* ---------- File filters ---------- */
const imageFilter = (req, file, cb) => {
  const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype);
  if (!ok) return cb(new Error("Only image files are allowed"));
  cb(null, true);
};

const pdfFilter = (req, file, cb) => {
  const isPdf =
    file.mimetype === "application/pdf" ||
    /\.pdf$/i.test(file.originalname) ||
    mime.extension(file.mimetype) === "pdf";
  if (!isPdf) return cb(new Error("Only PDF files are allowed"));
  cb(null, true);
};

// optional: image OR pdf (if you ever need a mixed endpoint)
const imageOrPdfFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname))
    return cb(null, true);
  if (/^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype))
    return cb(null, true);
  return cb(new Error("Only image or PDF files are allowed"));
};

/* ---------- Uploaders ---------- */
// existing image uploader (unchanged behavior)
const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_MB * 1024 * 1024 },
  fileFilter: imageFilter,
});

// NEW: PDF-only uploader (for investors)
const uploadPdf = multer({
  storage,
  limits: { fileSize: MAX_PDF_MB * 1024 * 1024 },
  fileFilter: pdfFilter,
});

// optional: mixed (image/PDF)
const uploadAnyDoc = multer({
  storage,
  limits: { fileSize: Math.max(MAX_IMAGE_MB, MAX_PDF_MB) * 1024 * 1024 },
  fileFilter: imageOrPdfFilter,
});

/* ---------- Path helpers ---------- */
const relPathFromFile = (file) => {
  if (!file) return null;
  const folder = path.basename(file.destination);
  return `${folder}/${file.filename}`.replace(/\\/g, "/");
};

const toPublicUrl = (req, relPath) => {
  if (!relPath) return null;
  const base =
    process.env.ASSET_BASE_URL ||
    `${req.protocol}://${req.get("host")}/uploads`;
  return `${base.replace(/\/$/, "")}/${relPath.replace(/^\/+/, "")}`;
};

const tryDeleteUpload = (relPath) => {
  if (!relPath) return;
  try {
    const abs = path.resolve(
      process.cwd(),
      "uploads",
      relPath.replace(/^(\.\/|\/)/, "")
    );
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch {}
};

module.exports = {
  upload, // images
  uploadPdf, // PDF-only (use this for Investor)
  uploadAnyDoc, // optional: image OR PDF
  UPLOAD_ROOT,
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
};
