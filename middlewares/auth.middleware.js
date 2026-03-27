const jwt = require("jsonwebtoken");
const Blacklist = require("../models/blacklist.model");
const {UserModel} = require("../models/user.model");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token is required",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false,message: "Unauthorized" });
    }
    const isTokenBlacklisted = await Blacklist.findOne({ token });
    if (isTokenBlacklisted) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    req.user = user;
    next();
  }
  catch (error) {
    console.log("Error in authentication middleware", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

exports.isSeller = async (req, res, next) => {
  try {
    if (req.user.role !== "seller") {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    next();
  }
  catch (error) {
    console.log("Error in seller authentication middleware", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};