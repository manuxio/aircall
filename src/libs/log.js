import log4js from 'log4js';
import config from './config';

const log = log4js.getLogger();
log.level = config.logLevel || 'debug';
export default log;