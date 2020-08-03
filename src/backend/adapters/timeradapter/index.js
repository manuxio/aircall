import {
  log
} from '../../../libs';

const timer = async (timeout, callback, ...rest) => {
  log.debug(`[TIMER ADAPTER] A new timer has been started!`);
  return await setTimeout(() => {
    log.debug(`[TIMER ADAPTER] A timer has expired!`);
    callback(...rest);
  }, timeout);
}
export default timer;