const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/order.controller');
const { isAuthenticated, isSeller } = require('../middlewares/auth.middleware');

router.post("/:userId/:razorpayOrderId/:razorpayPaymentId/:signature", createOrder);
router.get("/", isAuthenticated, getMyOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.patch("/:id/status", isAuthenticated, isSeller, updateOrderStatus);

module.exports = router;