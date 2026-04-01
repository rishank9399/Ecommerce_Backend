const { DeliveryModel } = require("../models/delivery.model");
const { DeliveryPartnerModel } = require("../models/deliveryPartner.model");
const { OrderModel } = require("../models/order.model");

const assignDelivery = async(req, res) => {
    try{ 
        const { orderId } = req.params;

        const order = await OrderModel.findOne({_id: orderId});
        if(!order){
            return res.status(404).json({ success: false, message: "Invalid order Id"});
        }

        const orderToBeDelivered = await DeliveryModel.findOne({ order: orderId });
        if(!orderToBeDelivered){
            return res.status(404).json({success: false, message: "Order not confirmed or found"});
        }

        let avilableDeliveryPartner = await DeliveryPartnerModel.findOneAndUpdate({isAvaliable: false}, {isAvaliable: true}, {new: true});

        if(!avilableDeliveryPartner){
            return res.status(400).json({ success: false, message: "Delivery partner not available"});
        }
        if(avilableDeliveryPartner.status === "picked"){
            return res.status(400).json({success: false, message: "Delivery partner already assigned"});
        }

        orderToBeDelivered.deliveryBoy = avilableDeliveryPartner._id;
        orderToBeDelivered.status = "picked";
        orderToBeDelivered.trackingURL = `/api/delivery/${orderId}`;

        order.status = "confirmed";
        await order.save();

        res.status(201).json({success: true, message: "Delivery partner assigned successfully"});
    }
    catch(err) {
        console.log("Error in assigining Delivery: ", err);
        res.status(500).json({ success: false, message: "Failed to assign delivery"})
    }
}

const trackDelivery = async(req, res) => {
    try{ 
        const { orderId } = req.params;

        const delivery = await DeliveryModel.findOne({order: orderId}).lean();
        if(!delivery){
            return res.status(400).json({success: false, message: "Invalid order Id"});
        }

        res.status(200).json({ success: true, data: delivery});
    }
    catch(err) {
        console.log("Error in track delivery: ", err);
        res.status(500).json({ success: false, message: "Failed to track order"});
    }
}

const updateDeliveryStatus = async(req, res) => {
    try{
        const { id } = req.params;
        const { status } = req.body;
        const delivery = await DeliveryModel.findOne({ _id: id});
        if(!delivery){
            return res.status(400).json({success: false, message: "Invalid delivery id"});
        }
        delivery.status = status;
        await delivery.save();

        res.status(201).json({ success: true, message: "Status updated successfully"});
    }
    catch(err) {
        console.log("Error in updating delivery status: ", err);
        res.status(500).json({success: false, message: "Failed to update delivery status"})
    }
}

module.exports = {assignDelivery, trackDelivery, updateDeliveryStatus};