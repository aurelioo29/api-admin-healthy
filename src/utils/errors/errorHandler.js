const multer = require("multer");

const errorHandler = (error, req, res, next) => {
  let code = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (error instanceof multer.MulterError) {
    code = 400;
  }

  // Tangani error dari mimetype (image validation)
  if (error.message && error.message.includes("Invalid file type")) {
    code = 400;
  }

  res.status(code).json({
    code,
    success: false,
    message: error.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};

module.exports = errorHandler;
