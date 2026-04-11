const mongoose = require("mongoose");
const Joi = require("joi");
const validator = require("validator");

const addressSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: [true, "Address is required"],
      minlength: 5,
      maxlength: 200,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
      minlength: 2,
      trim: true,
      lowercase: true,
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
      select: false
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: 3,
      maxlength: 30,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Invalid email",
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["seller", "user"],
      default: "user",
    },

    addresses: {
      type: [addressSchema],
      validate: {
        validator: (val) => val.length <= 5,
        message: "Max 5 addresses allowed",
      },
      default: [],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);


const addressJoi = Joi.object({
  address: Joi.string().min(5).max(200).required(),
  city: Joi.string().min(2).max(50).required(),
  state: Joi.string().min(2).max(50).required(),
  zip: Joi.string().min(4).max(10).required(),
  country: Joi.string().min(2).required(),
});

const validateUser = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required().trim(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(6).trim().required(),
    role: Joi.string().valid("seller", "user"),
    addresses: Joi.array().items(addressJoi).max(5),
  });

  return schema.validate(data);
};

const validateUserUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).trim(),
    email: Joi.string().email().trim(),
    password: Joi.string().min(6).trim(),
    role: Joi.string().valid("seller", "user"),
    addresses: Joi.array().items(addressJoi).max(5),
  });

  return schema.validate(data);
};


module.exports = {
  UserModel,
  validateUser,
  validateUserUpdate,
};