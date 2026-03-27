require('dotenv').config();
require('./config/db');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const indexRoute = require('./routes/index.route');
const userRoute = require('./routes/user.route');
const productRoute = require('./routes/product.route');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/api/user', userRoute);
app.use('/api/product', productRoute);

app.listen(PORT, () => {
    console.log("Server is running on port 3000");
});

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWJjNWVlMDVkZjE0ZWIzN2FhNTQ1YTgiLCJpYXQiOjE3NzM5NTI3MzcsImV4cCI6MTc3NDAzOTEzN30.B0aTSibbsI1u84sm1EiYivdo7WM3Oat3fIEZV27-MyM