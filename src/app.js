const express = require('express');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

app.use(rateLimiter);

app.get('/', (req, res) => {
  res.send('Welcome to the Express API Rate Limiter!');
});

app.use((err, req, res, next) => {
  logger.error(`Unexpected error: ${err.message}`);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
