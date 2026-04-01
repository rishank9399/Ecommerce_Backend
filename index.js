require('dotenv').config();
require('./config/db');
require('./config/redis');
const express = require('express');
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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/api/user', userRoute);
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/cart', cartRoute);
app.use('/api/payment', paymentRoute);
app.use('/api/orders', orderRoute);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});