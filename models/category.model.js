const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
      lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);


const CategoryModel = mongoose.model("Category", categorySchema);

const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().trim(),
  });

  return schema.validate(data);
};

module.exports = {
  CategoryModel,
  validateCategory,
};