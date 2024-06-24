const redis = require('redis');
const config = require('../config');
const logger = require('../utils/logger');

const client = redis.createClient({
  host: config.redis.host,
  port: config.redis.port
});

client.on('error', (err) => {
  logger.error(`Redis error: ${err}`);
});

const rateLimiter = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'default';
  const userPolicy = config.rateLimiter.userPolicies[userId] || config.rateLimiter.defaultPolicy;
  const key = `rate-limiter:${userId}`;
  
  client.multi()
    .set([key, 0, 'NX', 'PX', userPolicy.windowSize])
    .incr(key)
    .ttl(key)
    .exec((err, replies) => {
      if (err) {
        logger.error(`Redis transaction error: ${err}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      const requests = replies[1];
      const ttl = replies[2];

      if (requests > userPolicy.maxRequests) {
        logger.info(`Rate limit exceeded for user: ${userId}`);
        res.set('Retry-After', ttl);
        return res.status(429).json({ error: 'Too Many Requests' });
      }

      res.set('X-RateLimit-Limit', userPolicy.maxRequests);
      res.set('X-RateLimit-Remaining', userPolicy.maxRequests - requests);
      res.set('X-RateLimit-Reset', Date.now() + ttl * 1000);
      next();
    });
};

module.exports = rateLimiter;
