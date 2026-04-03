const express = require("express");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const {
  addToCart,
  getCart,
  addItemToCart,
  deleteFromCart,
  deleteCart,
} = require("../controllers/cart.controller");
const router = express.Router();

router.post("/", isAuthenticated, addToCart);
router.get("/", isAuthenticated, getCart);
router.patch("/:productId", isAuthenticated, addItemToCart);
router.delete("/:productId", isAuthenticated, deleteFromCart);
router.delete("/", isAuthenticated, deleteCart);

module.exports = router;
