const {
  ProductModel,
  validateProduct,
  validateUpdateProduct,
} = require("../models/product.model");
const uploadToCloudinary = require("../utils/cloudinaryUpload");
const productQueryValidation = require("../validators/productQueryValidator");
const redisClient = require("../config/redis");
const { invalidateProductCache } = require("../utils/invalidateCache");
const { CategoryModel } = require("../models/category.model");

const createProduct = async (req, res) => {
  try {
    const { title, price, discountedPrice, stock, description, category } =
      req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { error } = validateProduct({
      title,
      price,
      discountedPrice,
      stock,
      description,
      category,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    const result = await uploadToCloudinary(file.buffer);
    const product = await ProductModel.create({
      title,
      price,
      discountedPrice,
      stock,
      description,
      category,
      seller: req.user._id,
      image: result.secure_url,
    });
    invalidateProductCache(product._id);

    const isAvailable = await CategoryModel.findOne({name: category.toLowerCase()}).lean();
    if(!isAvailable){
      await CategoryModel.create({
        name: category.toLowerCase()
      })
    }
    res
      .status(201)
      .json({ success: true, message: "Product created successfully" });
  } catch (err) {
    console.log("Create Product Error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const { error } = productQueryValidation(req.query);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    let {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      sort,
    } = req.query;

    const cacheKey = `products:${JSON.stringify(req.query)}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedData) });
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = { isActive: true };

    if (category) filter.category = category;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    if (minRating) filter.rating = { $gte: minRating };

    if (search) {
      filter.$text = { $search: search };
    }

    let sortOption = { rating: -1 };

    if (sort === "price_asc") sortOption = { price: 1 };
    if (sort === "price_desc") sortOption = { price: -1 };
    if (sort === "newest") sortOption = { createdAt: -1 };
    if (sort === "rating") sortOption = { rating: -1 };

    let skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      ProductModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean(),
      ProductModel.countDocuments(filter),
    ]);

    const data = {
      page,
      limit,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      hasNextPage: page * limit < totalProducts,
      hasPrevPage: page > 1,
      products,
    };

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(data));
    if (category) {
      await redisClient.sAdd(`tag:category:${category}`, cacheKey);
    }
    // general list
    await redisClient.sAdd("tag:products:all", cacheKey);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.log("Get Products Error: ", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch products" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedData) });
    }

    let response = await ProductModel.findOne({ _id: id, isActive: true }).lean();
    if (!response) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Product ID" });
    }

    await redisClient.setEx(cacheKey, 300, JSON.stringify(response));

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    console.log("Error in finding product by ID: ", err);
    res.status(500).json({ success: false, message: "Failed to get product" });
  }
};

const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;
    let { title, price, discountedPrice, category, stock, description } =
      req.body || {};
    const file = req.file;
    if(price) price = Number(price);
    if(discountedPrice) discountedPrice = Number(discountedPrice)
    const { error } = validateUpdateProduct({
      title,
      price,
      discountedPrice,
      category,
      stock,
      description,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }
    if (file) {
      const result = await uploadToCloudinary(file.buffer);
      req.body.image = result.secure_url;
    }

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true },
    );

    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect Product ID" });
    }

    await invalidateProductCache(product);

    if(category){
      const isAvailable = await CategoryModel.findOne({name: category.toLowerCase()}).lean();
      if(!isAvailable){
        await CategoryModel.create({
          name: category.toLowerCase()
        })
      }
    }
    
    res
      .status(200)
      .json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.log("Error in updating product: ", err);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

const deleteProductById = async (req, res) => {
  try{
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    )
    if(!product){
      return res.status(400).json({success: false, message: "Invalid product"})
    }
    await invalidateProductCache(product);
    res.status(200).json({ success: true, message: "Successfully deleted product" });
  } catch(err) {
    console.log("Error in deleting product: ", err);
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductById,
  deleteProductById,
};
