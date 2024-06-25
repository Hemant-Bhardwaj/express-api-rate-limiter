
# express-api-rate-limiter

A sophisticated API rate limiter that allows developers to define complex policies for throttling requests. This package includes features like user-specific rate limits, dynamic rule adjustments based on usage patterns, integration with Redis for distributed rate limiting, detailed logging, and support for multiple storage backends.

# Features

- User-specific rate limits
- Dynamic rule adjustments based on usage patterns
- Integration with Redis for distributed rate limiting
- Detailed logging and monitoring capabilities
- Support for multiple storage backends

# Installation

```bash
npm install express-api-rate-limiter
```

# Configuration

```js
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

```

# Usage

```js
const express = require('express');
const rateLimiter = require('api-rate-limiter');
const logger = require('./utils/logger'); // Ensure you have a logger utility

const app = express();

app.use(rateLimiter);

app.get('/', (req, res) => {
  res.send('Welcome to the API Rate Limiter!');
});

app.use((err, req, res, next) => {
  logger.error(`Unexpected error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

```

# Testing

## Manual Testing

You can manually test the rate limiter using Postman or cURL:

#### Postman

1. Start your application:

```bash
node index.js
```

2. Open Postman and create a new request:

- Method: GET
- URL: http://localhost:3000/
- Add a header x-user-id with the value user123 (or any other value to test different rate limits).
3. Send multiple requests quickly to observe the rate limiting in action. (You should receive a 429 Too Many Requests response after exceeding the allowed limit).

#### cURL

1. Start your application:

```bash
node index.js
```

2. Send multiple requests using cURL:
```bash
for i in {1..60}; do curl -H "x-user-id: user123" -i http://localhost:3000/; done
```
You should see 429 Too Many Requests responses after exceeding the limit.

## Automated Testing

Install the necessary testing libraries:
```bash
npm install mocha chai supertest --save-dev
```

Create a test file (test/rateLimiter.test.js) with the following content:

```js
const request = require('supertest');
const app = require('../src/app');
const redis = require('redis');
const { expect } = require('chai');

describe('Rate Limiter Middleware', () => {
  let client;

  before((done) => {
    client = redis.createClient();
    client.on('ready', done);
    client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  });

  afterEach((done) => {
    client.flushdb(done);
  });

  after((done) => {
    client.quit(done);
  });

  it('should allow requests under the limit', (done) => {
    request(app)
      .get('/')
      .set('x-user-id', 'user123')
      .expect(200, done);
  });

  it('should rate limit requests over the limit', function (done) {
    this.timeout(5000);
    const requests = Array.from({ length: 51 }, (_, i) => i + 1);

    Promise.all(requests.map(() => {
      return request(app)
        .get('/')
        .set('x-user-id', 'user123')
        .then(res => res);
    }))
    .then((responses) => {
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses).to.have.lengthOf(1);
      done();
    })
    .catch(done);
  });

  it('should return correct rate limit headers', (done) => {
    request(app)
      .get('/')
      .set('x-user-id', 'user123')
      .expect('X-RateLimit-Limit', '50')
      .expect('X-RateLimit-Remaining', '49')
      .expect(200, done);
  });
});

```

Run your tests:

```bash
npm test
```

# Contributing

Contributions are welcome! Please open an issue or submit a pull request.

# License

This project is licensed under the MIT License.

