const mongoose = require("mongoose");
const Joi = require("joi");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },

        priceAtPurchase: {
          type: Number,
          required: true,
          min: 0,
        }
      },
    ],

    totalPrice: {
      type: Number,
      min: [0, "Total price cannot be negative"],
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1, "products.productId": 1 }, { unique: true });

const CartModel = mongoose.model("Cart", cartSchema);

const validateCart = (data) => {
  const productSchema = Joi.object({
    productId: Joi.string().hex().length(24).required(),
    quantity: Joi.number().min(1).required(),
    priceAtPurchase: Joi.number().min(0),
  });

  const schema = Joi.object({
    products: Joi.array().items(productSchema).min(1).required(),

    totalPrice: Joi.number().min(0),
  });

  return schema.validate(data);
};

module.exports = {
  CartModel,
  validateCart,
};