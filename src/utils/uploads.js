const multer = require("multer");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const mime = require("mime-types");

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");

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

    const dir = path.join(UPLOAD_ROOT, sub);
    ensureDir(dir);
    cb(null, dir);
  },

  filename(req, file, cb) {
    let baseSource = path.parse(file.originalname).name;

    if (/\/upload\/category-lab-tests/i.test(req.originalUrl)) {
      baseSource = req.body?.slug || req.body?.name || baseSource;
    } else if (
      /\/upload\/articles/i.test(req.originalUrl) ||
      /\/upload\/csr/i.test(req.originalUrl)
    ) {
      baseSource = req.body?.slug || req.body?.title || baseSource;
    } else {
      baseSource =
        req.body?.slug || req.body?.title || req.body?.name || baseSource;
    }

    const baseSlug = slugify(baseSource, { lower: true, strict: true });
    const ts = Date.now();
    const ext = `.${(
      mime.extension(file.mimetype) || path.extname(file.originalname).slice(1)
    ).toLowerCase()}`;
    cb(null, `${baseSlug}-${ts}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ok = /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype);
    if (!ok) return cb(new Error("Only image files are allowed"));
    cb(null, true);
  },
});

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
  upload,
  UPLOAD_ROOT,
  relPathFromFile,
  toPublicUrl,
  tryDeleteUpload,
};
