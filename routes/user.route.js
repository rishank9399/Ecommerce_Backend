const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, getUser, updateUser } = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const rateLimiter = require("../middlewares/rateLimiter.middleware");
const limits = require("../utils/rateLimitConfigs");

router.post("/register", registerUser);
router.post("/login", rateLimiter(limits.strict), loginUser);
router.post("/logout", logoutUser);
router.get("/profile", isAuthenticated, getUser);
router.patch("/update-profile", isAuthenticated, updateUser );

module.exports = router;