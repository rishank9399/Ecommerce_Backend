const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/order.controller');
const { isAuthenticated, isSeller } = require('../middlewares/auth.middleware');

router.post("/:razorpayOrderId/:razorpayPaymentId/:signature", isAuthenticated, createOrder);
router.get("/", isAuthenticated, getMyOrders);
router.get("/:orderId", isAuthenticated, getOrderById);
router.patch("/:orderId/status", isAuthenticated, isSeller, updateOrderStatus);

module.exports = router;