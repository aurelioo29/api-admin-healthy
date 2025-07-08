const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");

dotenv.config();

const notFound = require("./controllers/notfound");

const app = express();

app.use(morgan("dev"));

// List of Routes
const routes = require("./routes");

app.use("/", routes);

// Middleware not found handler
app.use(notFound);

module.exports = app;
