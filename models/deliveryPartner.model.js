const deliveryPartnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      maxlength: 100,
      trim: true,
    },

    isAvaiable: {
      type: Boolean,
      default: true,
    },

    phone: {
      type: Number,
      trim: true,
    }
  },
  { timestamps: true }
);

deliverySchema.index({ order: 1 }, { unique: true });

const DeliveryPartnerModel = mongoose.model("DeliveryPartner", deliveryPartnerSchema);

module.exports = {DeliveryPartnerModel};