const mongoose = require("mongoose");
const Joi = require("joi");

const orderSchema = new mongoose.Schema(
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
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    address: {
      type: String,
      minlength: 5,
      maxlength: 300,
      trim: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Seller is required"],
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

const OrderModel = mongoose.model("Order", orderSchema);

const validateOrder = (data) => {

  const schema = Joi.object({
    productId: Joi.string().hex().length(24).required(),

    quantity: Joi.number().min(1).required(),

    priceAtPurchase: Joi.number().min(0).required(),

    user: Joi.string().hex().length(24).required(),

    totalPrice: Joi.number().min(0).required(),

    address: Joi.string().min(5).max(200).required(),

    payment: Joi.string().hex().length(24).required(),

    status: Joi.string().valid(
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled"
    ),

    delivery: Joi.string().hex().length(24),
  });

  return schema.validate(data);
};

module.exports = {
  OrderModel,
  validateOrder,
};