const mongoose = require("mongoose");
const Joi = require("joi");

const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order is required"],
    },

    deliveryBoy: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "picked", "on_the_way", "delivered", "cancelled"],
      default: "pending",
    },

    trackingURL: {
      type: String,
      trim: true,
    },

    estimatedDeliveryTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

deliverySchema.index({ order: 1 }, { unique: true });

const deliveryModel = mongoose.model("Delivery", deliverySchema);

const validateDelivery = (data) => {
  const schema = Joi.object({
    order: Joi.string().hex().length(24).required(),

    deliveryBoy: Joi.string().min(3).max(50).required(),

    status: Joi.string().valid(
      "pending",
      "picked",
      "on_the_way",
      "delivered",
      "cancelled"
    ),

    trackingURL: Joi.string().uri(),

    estimatedDeliveryTime: Joi.date().required(),
  });

  return schema.validate(data);
};

module.exports = {
  deliveryModel,
  validateDelivery,
};