const express = require('express');
const {assignDelivery, updateDeliveryStatus, trackDelivery, createDeliveryPartner} = require('../controllers/delivery.controller');
const { isAuthenticated, isSeller } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post("/", createDeliveryPartner);
router.post("/:orderId", isAuthenticated, isSeller, assignDelivery);
router.get("/:orderId", isAuthenticated, trackDelivery);
router.patch("/:deliveryId/status", isAuthenticated, isSeller, updateDeliveryStatus);

module.exports = router;