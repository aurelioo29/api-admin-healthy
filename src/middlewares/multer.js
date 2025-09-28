const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const fs = require("fs");
const mime = require("mime-types");

const storage = multer.diskStorage({
  destination(req, file, cb) {
    let folder = "uploads/others";

    if (/\/upload\/csr/i.test(req.originalUrl)) folder = "uploads/csr";
    else if (/\/upload\/articles/i.test(req.originalUrl))
      folder = "uploads/articles";
    else if (/\/upload\/category-lab-tests/i.test(req.originalUrl))
      folder = "uploads/category-lab-tests";

    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename(req, file, cb) {
    const baseSource =
      req.body?.slug || req.body?.title || path.parse(file.originalname).name;

    const baseSlug = slugify(baseSource, { lower: true, strict: true });

    const ts = Date.now(); 

    const ext = `.${(
      mime.extension(file.mimetype) || path.extname(file.originalname).slice(1)
    ).toLowerCase()}`;

    cb(null, `${baseSlug}-${ts}${ext}`);
  },
});

module.exports = multer({ storage });
