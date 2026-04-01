const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
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
        type: String
    },
    status: {
        type: String,
        default: "pending"
    }
}, { timestamps: true });

const PaymentModel = mongoose.model("payment", paymentSchema);
module.exports = {PaymentModel};