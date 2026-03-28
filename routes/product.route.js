const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { isAuthenticated, isSeller } = require("../middlewares/auth.middleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("../controllers/product.controller");

router.get("/", getProducts);

router.post(
  "/",
  isAuthenticated,
  isSeller,
  upload.single("image"),
  createProduct,
);

router.get("/:id", getProductById);

router.patch(
  "/:id",
  isAuthenticated,
  isSeller,
  upload.single("image"),
  updateProductById,
);

router.delete("/:id", isAuthenticated, isSeller, deleteProductById);

module.exports = router;
