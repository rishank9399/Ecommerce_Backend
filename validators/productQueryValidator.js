const Joi = require("joi");

const validateProductQuery = (query) => {
  const schema = Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(50).default(10),
    category: Joi.string().optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    minRating: Joi.number().min(0).max(5).optional(),
    search: Joi.string().optional(),
    sort: Joi.string()
      .valid("price_asc", "price_desc", "newest", "rating")
      .optional(),
  });
  return schema.validate(query);
};

module.exports = validateProductQuery;