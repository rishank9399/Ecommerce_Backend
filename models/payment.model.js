const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "order",
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    signature: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true });

const Payment = mongoose.model("payment", paymentSchema);
module.exports = Payment;