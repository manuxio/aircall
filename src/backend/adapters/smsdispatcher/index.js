import {
  log
} from '../../../libs';

const send = async (recipient/*, message*/) => {
  log.debug(`[SMS DISPATCHER] Sent new message to ${recipient}`);
  return Promise.resolve();
}

export default send;