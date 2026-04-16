const { DeliveryModel } = require("../models/delivery.model");
const { DeliveryPartnerModel, validateDeliveryPartner } = require("../models/deliveryPartner.model");
const { OrderModel } = require("../models/order.model");
const redisClient = require("../config/redis")

const assignDelivery = async(req, res) => {
    try{ 
        console.log(req.params);
        const { orderId } = req.params;
        console.log(orderId)

        const order = await OrderModel.findOne({_id: orderId});
        if(!order){
            return res.status(404).json({ success: false, message: "Invalid order Id"});
        }

        const orderToBeDelivered = await DeliveryModel.findOne({ order: orderId });
        if(!orderToBeDelivered){
            return res.status(404).json({success: false, message: "Order not confirmed or found"});
        }

        if(order.status != "confirmed"){
            return res.status(400).json({success: false, message: "Failed to assign delivery partner"});
        }

        let availableDeliveryPartner = await DeliveryPartnerModel.findOneAndUpdate({isAvailable: true, currentOrder: null}, {isAvailable: false}, {new: true});

        if(!availableDeliveryPartner){
            return res.status(400).json({ success: false, message: "Delivery partner not available"});
        }

        orderToBeDelivered.deliveryBoy = availableDeliveryPartner._id;
        orderToBeDelivered.status = "picked";
        orderToBeDelivered.trackingURL = `/api/delivery/${orderId}`;
        availableDeliveryPartner.currentOrder = orderId;

        order.status = "shipped";
        await order.save();
        await orderToBeDelivered.save();
        await availableDeliveryPartner.save();
        await redisClient.del(`order:${orderId}`);

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

        const delivery = await DeliveryModel.findOne({order: orderId}).populate("order", "user").lean();
        if(!delivery){
            return res.status(400).json({success: false, message: "Invalid order Id"});
        }
        if (!delivery.order.user.equals(req.user._id)) {
            return res.status(401).json({success: false, message: "Unauthorized user"});
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
        const { deliveryId } = req.params;
        const { status } = req.body || {};
        const delivery = await DeliveryModel.findOne({ _id: deliveryId});
        if(!delivery){
            return res.status(400).json({success: false, message: "Invalid delivery id"});
        }
        const order = await OrderModel.findOne({ _id: delivery.order });
        if(!order) {
            return res.status(400).json({success: false, message: 'Order not found'});
        }
        const deliveryPartner = await DeliveryPartnerModel.findOne({ currentOrder: order._id});
        if(!deliveryPartner){
            return res.status(400).json({success: false, message: "Delivery partner not assigned yet"});
        }
        if(delivery.status === "delivered"){
            return res.status(400).json({success: false, message: "Product already delivered"});
        }
        if(delivery.status === "cancelled"){
            return res.status(400).json({success: false, message: "Product delivery cancled"});
        }
        
        if(status === "on_the_way"){
            delivery.status = status;
        }
        else if(status === "delivered"){
            delivery.status = status;
            delivery.estimatedDeliveryTime = Date.now();
            order.status = "delivered"
            deliveryPartner.isAvailable = true;
            deliveryPartner.currentOrder = null;
        }
        else if(status === "cancelled"){
            delivery.status = status;
            delivery.estimatedDeliveryTime = Date.now();
            order.status = "cancelled"
            deliveryPartner.isAvailable = true;
            deliveryPartner.currentOrder = null;
        } else {
            return res.status(400).json({success: false, message: "Unable to process your request"});
        }
        await deliveryPartner.save();
        await delivery.save();
        await order.save();

        res.status(201).json({ success: true, message: "Status updated successfully"});
    }
    catch(err) {
        console.log("Error in updating delivery status: ", err);
        res.status(500).json({success: false, message: "Failed to update delivery status"})
    }
}

const createDeliveryPartner = async(req, res) => {
    try{
        const { name, phone, isAvailable = true } = req.body || {};
        const { error } = validateDeliveryPartner({name, phone, isAvailable})
        if(error) {
            return res.status(400).json({success: false, message: error.details[0].message })
        }
        await DeliveryPartnerModel.create({ name, phone, isAvailable});
        res.status(200).json({success: true, message: "Delivery partner registered successfully"})
    }
    catch(err) {
        console.log("Error in creating delivery partner: ", err);
        res.status(500).json({success: false, message: "Failed to create delivery partner"});
    }
}

module.exports = {assignDelivery, trackDelivery, updateDeliveryStatus, createDeliveryPartner};