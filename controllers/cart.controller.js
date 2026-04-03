const { validateCart, CartModel } = require("../models/cart.model");
const { ProductModel } = require("../models/product.model");
const redisClient = require("../config/redis");

const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let { productId, quantity = 1 } = req.body;
    quantity = Number(quantity);

    let { error } = validateCart({ products: [{ productId, quantity }] });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    let product = await ProductModel.findById(productId);
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient stock" });
    }

    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = await CartModel.create({
        user: userId,
        products: [{ productId, quantity, priceAtPurchase: product.discountedPrice }],
        totalPrice: parseFloat((quantity * product.discountedPrice).toFixed(2)),
      });
      return res.status(201).json({
        success: true,
        message: "Product added to cart successfully",
        data: cart,
      });
    }
    let productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId,
    );

    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
      cart.products[productIndex].priceAtPurchase = product.discountedPrice;
      cart.totalPrice += parseFloat((quantity * product.discountedPrice).toFixed(2));
    } else {
      cart.products.push({ productId, quantity, priceAtPurchase: product.discountedPrice });
      cart.totalPrice += parseFloat((quantity * product.discountedPrice).toFixed(2));
    }

    await cart.save();
    await redisClient.del(`cart:${userId}`);
    res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      data: cart,
    });
  } catch (err) {
    console.log("Error in adding to cart: ", err);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `cart:${userId}`;
    const cachedCart = await redisClient.get(cacheKey);
    if (cachedCart) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedCart) });
    }
    let cart = await CartModel.findOne({ user: userId }).populate(
      "products.productId",
      "title image",
    );
    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(cart));
    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.log("Error in fetching cart: ", err);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    let product = await ProductModel.findOne({
      _id: productId,
      isActive: true,
    });
    if (!product) {
      return res
        .status(400)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await CartModel.findOne({ user: userId });
    if (!cart) {
      cart = await CartModel.create({
        user: userId,
        products: [{ productId, quantity: 1, priceAtPurchase: product.discountedPrice }],
        totalPrice: parseFloat((product.discountedPrice).toFixed(2)),
      });
      return res.status(201).json({
        success: true,
        message: "Product added to cart successfully",
        data: cart,
      });
    }
    let productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === productId,
    );
    if(productIndex === -1) {
        if (quantity > product.stock) {
            return res.status(400).json({ message: "Exceeds available stock" });
        }
        cart.products.push({ productId, quantity: 1, priceAtPurchase: product.discountedPrice });
        cart.totalPrice += parseFloat((product.discountedPrice).toFixed(2));
    }
    else {
        if (cart.products[productIndex].quantity + 1 > product.stock) {
            return res.status(400).json({ message: "Exceeds available stock" });
        }
        cart.products[productIndex].quantity += 1;
        cart.totalPrice += parseFloat((product.discountedPrice).toFixed(2));
    }
    await cart.save();
    await redisClient.del(`cart:${userId}`);
    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: cart,
    });
  } catch (err) {
    console.log("Error in updating cart: ", err);
  }
};

const deleteFromCart = async (req, res) => {
    try{ 
        const { productId } = req.params;
        const userId = req.user._id;
        let cart = await CartModel.findOne({ user: userId });
        if(!cart) {
            return res.status(404).json({ success: false, message: "Cart not found"});
        }
        let productIndex = cart.products.findIndex(p => p.productId.toString() === productId);
        if(productIndex === -1) {
            return res.status(404).json({ success: false, message: "Product not found in cart" });
        }
        let product = await ProductModel.findOne({_id: productId, isActive: true});
        if(!product) {
            return res.status(400).json({ success: false, message: "Product not found" });
        }
        cart.products[productIndex].quantity -= 1;
        cart.totalPrice -= parseFloat((product.discountedPrice).toFixed(2));
        if (cart.products[productIndex].quantity <= 0) {
            cart.products.splice(productIndex, 1);
        }
        await cart.save();
        await redisClient.del(`cart:${userId}`);
        res.status(200).json({ success: true, message: "Item removed from cart successfully" });
    }
    catch(err) {
        console.log("Error in deleting from cart", err);
        res.status(500).json({ success: false, message: "Failed to remove item."})
    }
}

const deleteCart = async(req, res) => {
    try{
        const userId = req.user._id;
        let cart = await CartModel.findOneAndDelete({ user: userId });
        if(!cart){
            return res.status(404).json({success: false, message: "Cart not found"});
        }
        await redisClient.del(`cart:${userId}`);
        res.status(200).json({ success: true, message: "Cart deleted successfully" });
    }
    catch(err) {
        console.log("Error in deleting cart: ", err);
        res.status(500).json({ success: false, message: "Failed to delete cart"});
    }
}
module.exports = { addToCart, getCart, addItemToCart, deleteFromCart, deleteCart };
