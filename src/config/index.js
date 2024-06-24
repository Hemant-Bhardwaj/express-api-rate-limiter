const config = {
    redis: {
      host: 'localhost',
      port: 6379
    },
    rateLimiter: {
      defaultPolicy: {
        windowSize: 60 * 1000, // 1 minute in milliseconds
        maxRequests: 100
      },
      userPolicies: {
        'user123': {
          windowSize: 60 * 1000, // 1 minute in milliseconds
          maxRequests: 50
        }
      }
    }
  };
  
  module.exports = config;
  