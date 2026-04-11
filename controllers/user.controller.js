const {UserModel, validateUser, validateUserUpdate } = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedToken;
    await user.save();
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"? true: false,
      sameSite: "Strict",
    });
    res
      .status(201)
      .json({ success: true, message: "User created successfully", accessToken });
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

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    user.refreshToken = hashedToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"? true: false,
      sameSite: "Strict",
    });

    res.status(200).json({ success: true, message: "Login successful", accessToken });
  } catch (error) {
    console.log("Error in logging In user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to login user" });
  }
};

exports.logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;
    
    if (token) {
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      } catch {
        res.clearCookie("refreshToken");
        return res.status(200).json({ success: true, message: "Logged out" });
      }
      const user = await UserModel.findById(decoded._id);
  
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.log("Error in logging Out user", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to logout user" });
  }
};

exports.getUser = async (req, res) => {
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

exports.updateUser = async (req, res) => {
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

exports.refreshToken = async(req, res) => {
  try{
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded._id) {
      return res.status(403).json({ message: "Invalid token payload" });
    }

    const user = await UserModel.findById(decoded._id).select("+refreshToken");
    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      user.refreshToken = null;
      await user.save();
      return res.status(403).json({ message: "Token reuse detected" });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const hashedToken = await bcrypt.hash(newRefreshToken, 10);
    user.refreshToken = hashedToken;
    await user.save();

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production"? true: false,
      sameSite: "Strict",
    });

    res.status(200).json({success: true, message: "Verified successfully", accessToken: newAccessToken})
  }
  catch(err) {
    console.log("Refresh Token error: ", err);
    res.clearCookie("refreshToken");
    return res.status(403).json({success: false, message: "Invalid refresh token"});
  }
}