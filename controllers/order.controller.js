const { CartModel } = require("../models/cart.model");
const { OrderModel } = require("../models/order.model");
const { PaymentModel } = require("../models/payment.model");
const redisClient = require("../config/redis");
const { validateUserUpdate } = require("../models/user.model");
const { DeliveryModel } = require("../models/delivery.model");

const createOrder = async (req, res) => {
  const userId = req.user._id;
  const { razorpayOrderId, razorpayPaymentId, signature } = req.params;
  try {
    const { address, city, state, zip, country } = req.body;
    const payment = await PaymentModel.findOne({
      razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: signature,
      status: "completed",
    }).lean(); // can use .select() as just need to check
    if (!payment) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payment details" });
    }
    const { error } = validateUserUpdate({
      addresses: [{ address, city, state, zip, country }],
    });
    if (error) {
      console.log(
        `Shipping address payment faliure: ${userId}, ${razorpayOrderId}, ${razorpayPaymentId}, ${signature}`,
      );
      console.log(error.details[0].message)
      return res
        .status(400)
        .json({ success: false, message: "Invalid shipping address" });
    }
    const cart = await CartModel.findOne({ user: userId }).populate("products.productId");
    if (!cart || cart.products.length === 0) {
      console.log(
        `Empty cart payment faliure: ${userId}, ${razorpayOrderId}, ${razorpayPaymentId}, ${signature}`,
      );
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }
    const orders = [];

    for (const item of cart.products) {
      if (item.productId.stock < item.quantity) {
        console.log(
          `Insufficient stock faliure: ${userId}, ${razorpayOrderId}, ${razorpayPaymentId}, ${signature}`,
        );
        return res.status(400).json({success: false, message: `Insufficient stock for ${item.productId.title}`});
      }

      orders.push({
        productId: item.productId._id,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        seller: item.productId.seller,
        address: `${address}, ${city}, ${state}, ${zip}, ${country}`,
        user: userId,
        payment: payment._id,
        status: "pending",
      });
    }

    await OrderModel.insertMany(orders);

    await CartModel.findOneAndDelete({ user: userId });
    await redisClient.del(`myOrders:${userId}`)
    res
      .status(201)
      .json({ success: true, message: "Order created successfully" });
  } catch (err) {
    console.log(
      `Error in creating order || ${userId}, ${razorpayOrderId}, ${razorpayPaymentId}, ${signature} ||: `,
      err,
    );
    res
      .status(500)
      .json({ success: false, message: "Error in creating order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const cacheKey = `myOrders:${userId}`;
    const cachedOrders = await redisClient.get(cacheKey);
    if (cachedOrders) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedOrders) });
    }

    //Remaining : Implement pagination and limit
    const orders = await OrderModel.find({ user: userId })
      .select("productId priceAtPurchase status createdAt payment")
      .populate("productId", "title image")
      .populate("payment", "amount paymentId")
      .sort({ createdAt: -1 })
      .lean();
    if (!orders || orders.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(orders));
    res.status(200).json({ success: true, data: orders }); // totalPrice -> priceAtPurchase to change in frontend
  } catch (err) {
    console.log("Error in fetching orders: ", err);
    res
      .status(500)
      .json({ success: false, message: "Error in fetching orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const userId = req.user._id;
    const orderId = req.params.orderId;
    const cacheKey = `order:${orderId}`;
    const cachedOrder = await redisClient.get(cacheKey);
    if (cachedOrder) {
      return res
        .status(200)
        .json({ success: true, data: JSON.parse(cachedOrder) });
    }

    const order = await OrderModel.findOne({ _id: orderId, user: userId })
      .select("productId priceAtPurchase status createdAt payment")
      .populate("productId", "title image")
      .populate("payment", "amount paymentId")
      .lean();
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(order));
    res.status(200).json({ success: true, data: order }); // here to
  } catch (err) {
    console.log("Erro  in fetching order details: ", err);
    res
      .status(500)
      .json({ success: false, message: "Error in fetching order details" });
  }
};

const updateOrderStatus = async (req, res) => { // no use of this controller
  try {
    const orderId = req.params.orderId;
    const { status } = req.body;

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    order.status = status;
    await order.save();

    if(order.status === 'confirmed'){
      await DeliveryModel.create({
          order: orderId,
          status: "pending",
          estimatedDeliveryTime: Date.now() + 7 * 24 * 60 * 60 * 1000
      })
      await redisClient.del(`order:${orderId}`)
      return res.status(201).json({success: true, message: "Order confirmed"})
    }
    await redisClient.del(`order:${orderId}`)
    res
      .status(200)
      .json({
        success: true,
        message: "Order status successfully updated",
        data: order,
      });
  } catch (err) {
    console.log("Error in updation order status: ", err);
    res
      .status(500)
      .json({ success: false, message: "Error in updating order status" });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
