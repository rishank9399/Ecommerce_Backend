const mongoose = require("mongoose");
const Joi = require("joi");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minlength: 3,
      maxlength: 100,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    discountedPrice: {
      type: Number,
      required: [true, "Discounted price is required"],
      min: [0, "Discounted price cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.price;
        },
        message: "Discounted price cannot be greater than original price",
      },
    },

    category: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
      lowercase: true,
    },

    stock: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    image: [
      {
        type: String,
        trim: true,
      },
    ],

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    numberOfReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

productSchema.index({ title: "text", category: "text" });

const productModel = mongoose.model("Product", productSchema);


const validateProduct = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),

    price: Joi.number().min(0).required(),

    discountedPrice: Joi.number()
      .min(0)
      .max(Joi.ref("price"))
      .required()
      .messages({
        "number.max": "Discounted price cannot exceed original price",
      }),

    category: Joi.string().min(2).max(50).required(),

    stock: Joi.number().min(0).required(),

    description: Joi.string().max(1000).allow(""),

    image: Joi.array().items(Joi.string().uri()),

    seller: Joi.string().hex().length(24).required(),
  });

  return schema.validate(data);
};

module.exports = {
  productModel,
  validateProduct,
};