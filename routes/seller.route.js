const express = require('express');
const router = express.Router();
const { getMyOrders, getOrderById, updateOrderStatus } = require('../controllers/seller.controller');
const { isAuthenticated, isSeller } = require('../middlewares/auth.middleware');

router.get("/order", isAuthenticated, isSeller, getMyOrders);
router.get("/order/:orderId", isAuthenticated, isSeller, getOrderById);
router.patch("/order/:orderId/status", isAuthenticated, isSeller, updateOrderStatus);

module.exports = router;