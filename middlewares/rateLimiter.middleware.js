const redisClient = require("../config/redis");

const rateLimiter = ({
  windowSizeInSeconds = 60,
  maxRequests = 10,
  blockDurationInSeconds = 300,
}) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id || req.ip;
      const route = req.baseUrl + req.path;

      const key = `rate_limit:${userId}:${route}`;
      const blockKey = `blocked:${userId}`;

      const currentTime = Date.now();
      const windowStart = currentTime - windowSizeInSeconds * 1000;

      const isBlocked = await redisClient.get(blockKey);
      if (isBlocked) {
        return res.status(429).json({
          success: false,
          message: "You are temporarily blocked due to excessive requests.",
        });
      }

      await redisClient.zRemRangeByScore(key, 0, windowStart);

      const requestCount = await redisClient.zCard(key);

      if (requestCount >= maxRequests) {
        if (requestCount >= maxRequests * 2) {
          await redisClient.set(
            blockKey,
            "true",
            { EX: blockDurationInSeconds }
          );
        }

        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      await redisClient.zAdd(key, [
        {
            score: currentTime,
            value: `${currentTime}-${Math.random()}`
        }
        ]);

      await redisClient.expire(key, windowSizeInSeconds);

      res.set({
        "X-RateLimit-Limit": maxRequests,
        "X-RateLimit-Remaining": Math.max(0, maxRequests - requestCount - 1),
        "X-RateLimit-Reset": Math.ceil(
          (windowStart + windowSizeInSeconds * 1000) / 1000
        ),
      });

      next();
    } catch (err) {
      console.error("Rate limiter error:", err);
      return res.status(500).json({success: false, message: "Something went wrong. Try again after sometime"});
    }
  };
};

module.exports = rateLimiter;