const express = require('express');
const { createPayment, verifyPayment } = require('../controllers/payment.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const rateLimiter = require('../middlewares/rateLimiter.middleware');
const router = express.Router();

router.post('/create/order', isAuthenticated, rateLimiter({windowSizeInSeconds:60, maxRequests: 3, blockDurationInSeconds: 600}), createPayment);
router.post('/verify', verifyPayment);

module.exports = router;