const { validateCategory, CategoryModel } = require("../models/category.model");
const redisClient = require("../config/redis")

const createCategory = async(req, res) => {
    try{
        const { name } = req.body;
        let { error } = validateCategory({name});
        if(error){
            return res.status(400).json({success: false, message: error.details[0].message});
        }
        const isExists = await CategoryModel.findOne({ name: name.toLowerCase() });
        if(isExists){
            return res.status(400).json({success: false, message: "Category already exists"})
        }
        await CategoryModel.create({ name });
        await redisClient.del(`category: ${id}`);
        res.status(200).json({success: true, message: "Category created successfully"});
    }
    catch(err) {
        console.log("Error occured in creating category: ", err);
        res.status(500).json({status: false, message: "Failed to create category"})
    }
}

const getAllCategories = async(req, res) => {
    try{
        const cacheKey = "categories:all";
        const cachedCategories = await redisClient.get(cacheKey);
        if(cachedCategories) {
            return res.status(200).json({success: true, data: JSON.parse(cachedCategories)});
        }
        const categories = await CategoryModel.find({isDeleted: false}).sort({ createdAt: -1 });
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(categories));
        res.status(200).json({success: true, data: categories});
    }
    catch(err) {
        console.log("Error occured in fetching categories: ", err);
        res.status(500).json({success: false, message: "Failed to fetch categories"})
    }
}

const getCategoryById = async(req, res) => {
    try{
        const { id } = req.params;
        const cacheKey = `category:${id}`;
        const cachedCategory = await redisClient.get(cacheKey);
        if(cachedCategory) {
            return res.status(200).json({success: true, data: JSON.parse(cachedCategory)});
        }
        const category = await CategoryModel.findById(id);
        if(!category) {
            return res.status(400).json({success: false, message: "Incorrect category ID"});
        }
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(category));
        res.status(200).json({success: true, data: category});
    }
    catch(err) {
        console.log("Error occured in fetching category: ", err);
        res.status(500).json({success: false, message: "Failed to fetch category"})
    }
}

const updateCategoryById = async(req, res) => {
    try{
        const { id } = req.params;
        const { name } = req.body || {};
        let { error } = validateCategory({name});
        if(error){
            return res.status(400).json({success: false, message: error.details[0].message});
        }
        const category = await CategoryModel.findById(id);
        if(!category) {
            return res.status(400).json({success: false, message: "Incorrect category ID"});
        }
        category.name = name.toLowerCase();
        await category.save();
        await redisClient.del(`category: ${id}`);
        res.status(200).json({success: true, message: "Category updated successfully"});

    }
    catch(err) {
        console.log("Error in updating category: ", err);
        res.status(500).json({success: false, message: "Failed to update category"})
    }
}

const deleteCategoryById = async(req, res) => {
    try{
        const { id } = req.params;
        const category = await CategoryModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
        if(!category) {
            return res.status(400).json({success: false, message: "Incorrect category ID"});
        }
        await redisClient.del(`category:${id}`);
        res.status(200).json({success: true, message: "Category deleted successfully"});
    }
    catch(err) {
        console.log("Error in deleting category: ", err);
        res.status(500).json({success: false, message: "Error in deleting category"});
    }
}

module.exports = { createCategory, getAllCategories, getCategoryById, updateCategoryById, deleteCategoryById };