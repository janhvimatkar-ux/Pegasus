import app from './app';
import config from './config';
import logger from './utils/logger';

const server = app.listen(config.port, () => {
  logger.info(`Server is running on port ${config.port}`);
});

export default server;
