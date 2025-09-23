const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

const { authRoutes, router, csrRoutes } = require("./routes");
const notFound = require("./controllers/notfound");

const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "500mb" }));

morgan.token("local-time", () => {
  return dayjs().tz("Asia/Jakarta").format("YYYY-MM-DD HH:mm:ss");
});

app.use(
  morgan(
    "[:local-time] :method :url :status :res[content-length] - :response-time ms"
  )
);

// List of Routes
app.use("/", router);
app.use("/api", authRoutes, csrRoutes);

// Middleware not found handler
app.use(notFound);

module.exports = app;
