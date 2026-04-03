const limits = {
  strict: {
    windowSizeInSeconds: 60,
    maxRequests: 5,
    blockDurationInSeconds: 300,
  },
  moderate: {
    windowSizeInSeconds: 60,
    maxRequests: 20,
  },
  relaxed: {
    windowSizeInSeconds: 60,
    maxRequests: 100,
  },
};

module.exports = limits;