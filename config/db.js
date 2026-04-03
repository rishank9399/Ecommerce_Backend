const mongoose = require('mongoose');

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Connected to DB");
    } catch (err) {
        console.log("Error connecting to DB", err);
        process.exit(1);
    }
}

module.exports = db;