const mongoose = require("mongoose");
const Joi = require("joi");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },

    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [200, "Comment cannot exceed 200 characters"],
    },
  },
  { timestamps: true }
);


reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

const ReviewModel = mongoose.model("Review", reviewSchema);


const validateReview = (data) => {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),

    productId: Joi.string().hex().length(24).required(),

    rating: Joi.number().min(1).max(5).required(),

    comment: Joi.string().max(200).allow(""),
  });

  return schema.validate(data);
};


module.exports = {
  ReviewModel,
  validateReview,
};