const jwt = require("jsonwebtoken");
const {UserModel} = require("../models/user.model");

exports.isAuthenticated = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Token is required",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false,message: "Unauthorized" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token expired or invalid",
      });
    }

    if (!decoded._id || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      _id: decoded._id,
      role: decoded.role,
    };
    next();
  }
  catch (error) {
    console.log("Error in authentication middleware", error);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

exports.isSeller = (req, res, next) => {
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