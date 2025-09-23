const express = require("express");
const authRoutes = require("./auth");
const csrRoutes = require("./csr");

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
};
