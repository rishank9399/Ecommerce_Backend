const express = require('express');
const {assignDelivery, updateDeliveryStatus, trackDelivery} = require('../controllers/delivery.controller');
const { isAuthenticated, isSeller } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post("/:orderId", isAuthenticated, isSeller, assignDelivery);
router.get("/:orderId", isAuthenticated, trackDelivery);
router.patch("/:id/status", isAuthenticated, isSeller, updateDeliveryStatus);

module.exports = router;