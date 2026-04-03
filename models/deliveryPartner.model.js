const mongoose = require("mongoose");
const Joi = require("joi");

const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 100,
      trim: true,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },

    phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

deliveryPartnerSchema.index({ isAvailable: 1, currentOrder: 1 });

const DeliveryPartnerModel = mongoose.model(
  "DeliveryPartner",
  deliveryPartnerSchema
);

const validateDeliveryPartner = (data) => {
  const schema = Joi.object({
    name: Joi.string().max(100).trim().required(),

    isAvailable: Joi.boolean(),

    currentOrder: Joi.string().optional(),

    phone: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required(),
  });

  return schema.validate(data);
};

module.exports = {
  DeliveryPartnerModel,
  validateDeliveryPartner,
};