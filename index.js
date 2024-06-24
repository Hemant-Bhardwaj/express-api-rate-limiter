const app = require('./src/app');
const config = require('./src/config');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
