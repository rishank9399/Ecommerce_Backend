require('dotenv').config();
require('./config/redis');
const ConnectDB = require('./config/db');
ConnectDB();

const express = require('express');
const rateLimiter = require("./middlewares/rateLimiter.middleware");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');
const categoryRoute = require('./routes/category.route');
const reviewRoute = require('./routes/review.route');
const cartRoute = require('./routes/cart.route');
const paymentRoute = require('./routes/payment.route');
const orderRoute = require('./routes/order.route');
const DeliveryRoute = require('./routes/delivery.route');
const limits = require('./utils/rateLimitConfigs');

app.use(cors()); //As of now allowing all origins
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter(limits.relaxed));

app.use('/', indexRoute);
app.use('/api/user', userRoute);
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/cart', cartRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/order', orderRoute);
app.use('/api/delivery', DeliveryRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});