import pino from 'pino';
import config from './config';

const logLevel = config.get<string>('logging.level');

const logger = pino({
	level: logLevel,
});

export default logger;
