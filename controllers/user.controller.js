const {UserModel, validateUser, validateUserUpdate } = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Blacklist = require("../models/blacklist.model");

exports.registerUser = async (req, res, next) => {
  try {
    let { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    email = email.toLowerCase();
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }
    const { error } = validateUser({
      username,
      email,
      password,
      role,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await UserModel.create({
      username,
      email,
      password: hashedPassword,
      role,
    });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res
      .status(201)
      .json({ success: true, message: "User created successfully", token });
  } catch (error) {
    console.log("Error while creating user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to create user" });
  }
};

exports.loginUser = async (req, res, next) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    email = email.toLowerCase();
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    res.status(200).json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.log("Error in logging In user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to login user" });
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Token is required...." });
    }

    const isTokenBlacklisted = await Blacklist.findOne({ token });
    if (isTokenBlacklisted) {
      return res
        .status(400)
        .json({ success: false, message: "Token is already blacklisted" });
    }
    await Blacklist.create({ token });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log("Error in logging Out user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to logout user" });
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    res
      .status(200)
      .json({
        success: true,
        data: user,
      });
  } catch (error) {
    console.log("Error in fetching user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch user" });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    let updateData = {};

    if (username) updateData.username = username;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    const { error } = validateUserUpdate({ username, password });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const user = await UserModel.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true },
    );
    res
      .status(200)
      .json({ success: true, message: "User updated successfully" });
  } catch (error) {
    console.log("Error in updating user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update user" });
  }
};
