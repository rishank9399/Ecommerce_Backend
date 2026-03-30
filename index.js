require('dotenv').config();
require('./config/db');
require('./config/redis');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');
const categoryRoute = require('./routes/category.route');
const reviewRoute = require('./routes/review.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/api/user', userRoute);
app.use('/api/products', productRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/reviews', reviewRoute);

app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});