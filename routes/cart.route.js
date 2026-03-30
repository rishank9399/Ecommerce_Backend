const express = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { addToCart, getCart, updateCart } = require('../controllers/cart.controller');
const router = express.Router();

router.post("/", isAuthenticated, addToCart);
router.get("/", isAuthenticated, getCart);
router.put("/:id", isAuthenticated, updateCart);

module.exports = router;