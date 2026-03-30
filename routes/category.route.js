const express = require("express");
const router = express.Router();
const { isAuthenticated, isSeller } = require("../middlewares/auth.middleware");
const {
  createCategory,
  updateCategoryById,
  getCategoryById,
  getAllCategories,
  deleteCategoryById
} = require("../controllers/category.controller");

router.post("/", isAuthenticated, isSeller, createCategory);
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.put("/:id", isAuthenticated, isSeller, updateCategoryById);
router.delete("/:id", isAuthenticated, isSeller, deleteCategoryById);

module.exports = router;
