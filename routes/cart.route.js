const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addToCart,
  getCart,
  addItemToCart,
  deleteFromCart,
  deleteCart,
} = require("../controllers/cart.controller");
const limits = require("../utils/rateLimitConfigs");
const rateLimiter = require("../middlewares/rateLimiter.middleware");
const router = express.Router();

router.post("/", isAuthenticated, rateLimiter(limits.moderate), addToCart);
router.get("/", isAuthenticated, getCart);
router.patch("/:productId", isAuthenticated, addItemToCart);
router.delete("/:productId", isAuthenticated, deleteFromCart);
router.delete("/", isAuthenticated, deleteCart);

module.exports = router;
