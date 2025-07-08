const rateLimit = require("express-rate-limit");

const isRateLimiterEnabled = process.env.ENABLE_RATE_LIMIT === "true";

let rateLimiter = (request, response, next) => next();

if (isRateLimiterEnabled) {
  rateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 100 requests per windowMs
    message: {
      status: 429,
      error: "Too many requests, please try again later.",
    },
  });
}

module.exports = rateLimiter;
