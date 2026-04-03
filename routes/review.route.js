const express = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { addReview, deleteReview, getReviews } = require('../controllers/review.controller');
const router = express.Router();

router.post("/:productId", isAuthenticated, addReview);
router.get("/:productId", isAuthenticated, getReviews);
router.delete("/:reviewId", isAuthenticated, deleteReview);

module.exports = router;