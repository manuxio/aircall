import Promise from 'bluebird';
import moment from 'moment';

import smsSend from '../adapters/smsdispatcher';
import emailSend from '../adapters/emaildispatcher';

import {
  config,
  log
} from '../../libs';

const getPolicyMaxLevel = (policy) => {
  const maxLevel = Object.keys(policy.levels).reduce((prev, curr) => {
    const val = parseInt(curr, 10);
    if (prev > val) {
      return prev;
    }
    return val;
  }, parseInt(Object.keys(policy.levels)[0], 10));
  return maxLevel;
}

const getPolicyBestLevel = (service, policy) => {
  const maxLevel = getPolicyMaxLevel(policy);
  return policy.levels[(Math.min(maxLevel, service.currentAlert.level)).toString()];
}

const sendMessagesForServiceAndPolicy = (service, policy) => {
  const {
    subjectTemplate,
    messageTemplate
  } = policy;
  const {
    phoneNumbers,
    mailAddresses
  } = getPolicyBestLevel(service, policy);
  const subject = generateMessageFromAlertAndTemplate(service, subjectTemplate);
  const message = generateMessageFromAlertAndTemplate(service, messageTemplate);
  return Promise.resolve()
    .then(
      () => Promise.mapSeries(phoneNumbers, (number) => {
        return smsSend(number, message);
      })
    )
    .then(
      () => Promise.mapSeries(mailAddresses, (address) => {
        return emailSend(address, subject, message);
      })
    )
    .then(
      () => log.debug('[APPLICATION] Alert messages dispatched')
    )
    .then(
      () => policy
    );
}

const generateMessageFromAlertAndTemplate = (service, template) => {
  const placeHolders = {
    _serviceid_: service.id,
    _alerttime_: moment(service.currentAlert.alertTime).format('DD/MM/YY HH:mm:ss'),
    _escalationlevel_: service.currentAlert.level,
    _aknowledgeurl_: config.aknowledgeBaseUrl.replace('_serviceid_', service.id)
  };
  const keys = Object.keys(placeHolders);
  let retval = template;
  keys.forEach((k) => {
    const v = placeHolders[k];
    retval = retval.replace(new RegExp(k, 'gi'), v);
  });
  return retval;
}

export default {
  sendMessagesForServiceAndPolicy,
  generateMessageFromAlertAndTemplate,
  getPolicyBestLevel,
  getPolicyMaxLevel
}
