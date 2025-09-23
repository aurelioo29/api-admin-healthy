const { Op } = require("sequelize");

const findByIdOrSlug = async (Model, identifier, options = {}) => {
  const isNumeric = !isNaN(Number(identifier));

  const whereCondition = isNumeric ? { id: identifier } : { slug: identifier };

  const result = await Model.findOne({
    where: whereCondition,
    ...options,
  });

  return result;
};

module.exports = findByIdOrSlug;
