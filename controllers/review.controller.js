const redisClient = require("../config/redis");
const mongoose = require("mongoose");
const { ProductModel } = require("../models/product.model");
const { ReviewModel, validateReview } = require("../models/review.model");
const { invalidateReviewCache } = require("../utils/invalidateCache");


const addReview = async(req, res) => {
    try{
        const { rating, comment } = req.body;
        const userId = req.user._id;
        const productId = req.params.id;

        let { error } = validateReview({ userId, productId, rating, comment });
        if(error) {
            return res.status(400).json({success: false, message: error.details[0].message});
        }

        const existingReview = await ReviewModel.findOne({ userId, productId });
        if(existingReview) {
            return res.status(400).json({success: false, message: "You have already reviewed this product" });
        }

        const product = await ProductModel.findOne({ _id: productId, isActive: true });
        if(!product) {
            return res.status(400).json({success: false, message: "Invalid product ID" });
        }

        const review = ReviewModel.create({
            userId,
            productId,
            rating,
            comment
        });

        await invalidateReviewCache(productId);

        product.rating = (product.rating * product.numberOfReviews + rating) / (product.numberOfReviews + 1);
        product.numberOfReviews += 1;
        await product.save();

        res.status(201).json({success: true, message: "Review added successfully" });
    }
    catch(err) {
        console.log("Error in adding review: ", err);
        res.status(500).json({success: false, message: "Failed to add review"});
    }
}

const getReviews = async(req, res) => {
    try{
        const productId = req.params.id;
        const cacheKey = `reviews:${productId}`;
        const cachedReviews = await redisClient.get(cacheKey);
        if(cachedReviews){
            return res.status(200).json({success: true, data: JSON.parse(cachedReviews) });

        }
        const reviews = await ReviewModel.find({ productId }).populate("userId", "name");
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(reviews));
        res.status(200).json({success: true, reviews});
    }
    catch(err) {
        console.log("Error in fetching reviews: ", err);
        res.status(500).json({success: false, message: "Failed to fetch reviews"});
    }
}

const deleteReview = async(req, res) => {
    try{
        const session = await mongoose.startSession();
        session.startTransaction();
        const reviewId = req.params.id;
        const userId = req.user._id;

        const review = await ReviewModel.findOneAndDelete({ _id: reviewId, userId }, {session});
        if(!review) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({success: false, message: "Review not found" });
        }
        
        const product = await ProductModel.findById(review.productId);
        if(product) {
            if (product.numberOfReviews > 1) {
                product.rating =
                    ((product.rating * product.numberOfReviews) - review.rating) /
                    (product.numberOfReviews - 1);
            } else {
                product.rating = 0;
            }

            product.numberOfReviews -= 1;
            await product.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        await invalidateReviewCache(review.productId);
        res.status(200).json({success: true, message: "Review deleted successfully" });
    }
    catch(err) {
        console.log("Error in deleting review: ", err);
        res.status(500).json({success: false, message: "Failed to delete review"});
    }
}

module.exports = { addReview, getReviews, deleteReview };