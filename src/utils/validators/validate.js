const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const mappedErrors = {};
  result.array().forEach((err) => {
    const key = err.path || err.param || "_global";

    if (!mappedErrors[key]) mappedErrors[key] = err.msg;
  });

  return res.status(400).json({
    code: 400,
    success: false,
    errors: mappedErrors,
  });
};

module.exports = validate;
