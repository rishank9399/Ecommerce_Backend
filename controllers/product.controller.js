const Product = require("../models/product.model");
const uploadToCloudinary = require("../utils/cloudinaryUpload");

const createProduct = async (req, res) => {
  try {
    const { name, description, price} = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(file.buffer);

    const newProduct = await Product.create({
      name,
      description,
      price,
      seller: req.user._id,
      image: result.secure_url,
    })

    res.json({
      message: "Product created successfully",
      product: newProduct,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createProduct };