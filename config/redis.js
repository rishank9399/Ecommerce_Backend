const redis = require("redis");

const client = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
    }
});

client.connect()
    .then(() => {
        console.log("Connected to Redis");
    })
    .catch((err) => {
        console.error("Error connecting to Redis:", err);
    });

module.exports = client;