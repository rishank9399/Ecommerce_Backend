const express = require('express');
const { createPayment, verifyPayment } = require('../controllers/payment.controller');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const router = express.Router();

router.post('/create/order', isAuthenticated, createPayment);
router.post('/verify', verifyPayment);

module.exports = router;