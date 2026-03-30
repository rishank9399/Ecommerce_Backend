const redisClient = require("../config/redis");

const invalidateProductCache = async (product) => {
  await redisClient.del(`product:${product._id}`);

  const categoryKeys = await redisClient.sMembers(
    `tag:category:${product.category}`,
  );

  if (categoryKeys.length) {
    await redisClient.del(categoryKeys);
    await redisClient.del(`tag:category:${product.category}`);
  }

  const allKeys = await redisClient.sMembers("tag:products:all");

  if (allKeys.length) {
    await redisClient.del(allKeys);
    await redisClient.del("tag:products:all");
  }
  return;
};

const invalidateReviewCache = async(productId) => {
  await redisClient.del(`reviews:${productId}`);
  return;
}

module.exports = { invalidateProductCache, invalidateReviewCache };
