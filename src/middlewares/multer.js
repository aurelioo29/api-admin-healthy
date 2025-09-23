const multer = require("multer");
const path = require("path");
const slugify = require("slugify");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads/others";

    if (/\/upload\/csr/i.test(req.originalUrl)) folder = "uploads/csr";
    // else if (req.baseUrl.includes("/blog")) folder = "uploads/blog";
    // else if (req.baseUrl.includes("/news")) folder = "uploads/news";

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    const originalName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);

    const slug = slugify(originalName, { lower: true });
    const timestamp = Date.now();

    const filename = `${slug}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

module.exports = upload;
