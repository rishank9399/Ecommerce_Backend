const express = require('express');
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { addReview, deleteReview, getReviews } = require('../controllers/review.controller');
const router = express.Router();

router.post("/:id", isAuthenticated, addReview);
router.get("/:id", isAuthenticated, getReviews);
router.delete("/:id", isAuthenticated, deleteReview);

module.exports = router;