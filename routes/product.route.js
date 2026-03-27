const express = require("express");
const router = express.Router();
const { createProduct } = require("../controllers/product.controller");
const upload = require("../middlewares/multer");

router.post("/upload", upload.single("image"), createProduct);

module.exports = router;