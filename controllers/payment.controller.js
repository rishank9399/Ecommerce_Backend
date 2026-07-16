const Razorpay = require('razorpay');
const { PaymentModel } = require('../models/payment.model.js');
const { CartModel } = require('../models/cart.model.js');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createPayment = async (req, res) => {
    
  try {
    const userId = req.user._id;
    const cart = await CartModel.findOne({ user: userId }).select('totalPrice').lean();
    if(!cart || cart.totalPrice <= 0) {
      return res.status(400).json({success: false, mesage: "Cart is empty" });
    }
    const options = {
      amount: cart.totalPrice * 100,
      currency: "INR",
    };
    const order = await razorpay.orders.create(options);

    const newPayment = await PaymentModel.create({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: 'pending',
    });
    res.status(200).json( order);


  } catch (err) {
    console.log("Error in creating order: ", err);
    res.status(500).json({success: false, message: 'Error creating order'});
  }
};

const verifyPayment = async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET

  try {
    const { validatePaymentVerification } = require('../node_modules/razorpay/dist/utils/razorpay-utils.js')

    const result = validatePaymentVerification({ "order_id": razorpayOrderId, "payment_id": razorpayPaymentId }, signature, secret);
    if (result) {
      const payment = await PaymentModel.findOne({ razorpayOrderId });
      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = 'completed';
      await payment.save();
      res.json({ status: 'success', message: "Payment verified successfully" });
    } else {
      res.status(400).json({success: false, message: 'Invalid signature'});
    }
  } catch (err) {
    console.log("Error in verifying payment: ", err);
    res.status(500).json({success: false, message: 'Error verifying payment'});
  }
}

module.exports = { createPayment, verifyPayment };