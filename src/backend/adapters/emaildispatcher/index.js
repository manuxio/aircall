import {
  log
} from '../../../libs';

const send = async (recipient, subject/*, message*/) => {
  log.debug(`[EMAIL DISPATCHER] Sent new message to ${recipient} with subject ${subject}`);
  return Promise.resolve();
}

export default send;