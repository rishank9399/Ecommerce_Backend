const redis = require("redis");

const client = redis.createClient({
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        reconnectStrategy: (retries) => {
            console.log(`Redis retry attempt: ${retries}`);
            return Math.min(retries * 100, 3000);
        }
    }
});

client.on("error", (err) => {
    console.error("Redis Error:", err);
});

client.on("connect", () => {
    console.log("Redis connecting...");
});

client.on("ready", () => {
    console.log("Redis ready to use");
});

client.on("reconnecting", () => {
    console.log("Redis reconnecting...");
});

client.connect()
    .then(() => {
        console.log("Connected to Redis");
    })
    .catch((err) => {
        console.error("Error connecting to Redis:", err);
    });

module.exports = client;