import moment from 'moment';
import db from '../adapters/persistence';
import escalationPolicyProvider from '../adapters/escalationPolicyProvider';
import startTimer from '../adapters/timeradapter';
import policyHelpers from './policyHelpers';

// console.log('policyHelpers', policyHelpers);

import {
  log
} from '../../libs';

import models from './models';


const loadService = async (serviceId) => {
  return db.getRecordById(serviceId, true) // Load the service
    .catch(
      async (/* e */) => { // You can ignore this error, it will be logged by the persistence adapter...
        log.trace(`[APPLICATION] Unable to load service ${serviceId}, attempting to create new one!`); // You might also want to comment this line!
        return db.createOrUpdateRecordById(serviceId, models.service) // Try to create a new service
          .then(
            () => db.getRecordById(serviceId) // Re-Load the service
          );
      }
    );
};

const setServiceCrashed = async (service, message = '') => {
  if (service.healthy) {
    // const escalationPolicy = await escalationPolicyProvider.getRecordById(service); // This should never fail!
    const newService = Object.assign({}, service, {
      healthy: false,
      currentAlert: Object.assign({}, models.alert, { message, alertTime: moment().toISOString() })
    });
    return escalationPolicyProvider.getRecordById(newService.escalationPolicyId)
      .then(
        (policy) => policyHelpers.sendMessagesForServiceAndPolicy(newService, policy)
      )
      .then(
        (policy) => {
          const theLevel = policyHelpers.getPolicyBestLevel(newService, policy);
          if (theLevel.acknowledgeTimeout) {
            startTimer(theLevel.acknowledgeTimeout, acknowledgeTimeout, newService.id, policy);
          }
        }
      )
      .then(
        () => db.createOrUpdateRecordById(service.id, newService)
      );
  }
  log.debug(`[APPLICATION] Service ${service.id} crashed again...`);
  return service;
};

const setServiceHealthy = async (service) => {
  if (!service.healthy) {
    // const escalationPolicy = await escalationPolicyProvider.getRecordById(service); // This should never fail!
    const newService = Object.assign({}, service, {
      healthy: true
    });
    return db.createOrUpdateRecordById(service.id, newService);
  }
  log.debug(`[APPLICATION] Service ${service.id} set as healthy... again?`);
  return service;
};

const acknowledgeCurrentAlert = async (service) => {
  if (!service.healthy) {
    // const escalationPolicy = await escalationPolicyProvider.getRecordById(service); // This should never fail!
    const newService = Object.assign({}, service, {
      currentAlert: Object.assign({}, service.currentAlert, {
        acknowledged: true
      })
    });
    log.debug(`[APPLICATION] Service ${service.id} got an alert acknowledged!`)
    return db.createOrUpdateRecordById(service.id, newService);
  }
  log.debug(`[APPLICATION] Service ${service.id} got an alert ack, but the service is healthy`);
  return service;
}

const acknowledgeTimeout = async (serviceId) => {
  return loadService(serviceId)
    .then(
      (service) => {
        if (service.healthy) {
          // Maybe do something?
          return;
        }
        const {
          currentAlert
        } = service;
        if (!service.healthy && currentAlert.acknowledged) {
          // Maybe do something?
          log.debug(`[APPLICATION] A timer for a crashed service has expired, but the alert was already acknowledged`);
          return;
        }
        // currentAlert.level = currentAlert.level + 1;
        return escalationPolicyProvider.getRecordById(service.escalationPolicyId)
          .then(
            (policy) => {
              const maxLevel = policyHelpers.getPolicyMaxLevel(policy);
              if (maxLevel > currentAlert.level) {
                log.debug(`[APPLICATION] Incrementing alert level for service ${service.id} from ${currentAlert.level} to ${currentAlert.level + 1}`);
                currentAlert.level = currentAlert.level + 1;
                return policyHelpers.sendMessagesForServiceAndPolicy(service, policy)
                  .then(
                    (policy) => {
                      const theLevel = policyHelpers.getPolicyBestLevel(service, policy);
                      if (theLevel.acknowledgeTimeout) {
                        startTimer(theLevel.acknowledgeTimeout, acknowledgeTimeout, service.id, policy);
                      }
                    }
                  )
                  .then(
                    () => db.createOrUpdateRecordById(service.id, service)
                  )
              } else {
                // Nothing do to?
                log.debug(`[APPLICATION] Service ${service.id} is crashed and noone aknowledged the crash, unfortunetaly there's no one else to notify. Is everybody asleep?`)
                return service;
              }
            }
          )
      }
    )
}

const listServiceIds = async () => {
  return db.getAllRecordIds();
}

export default {
  loadService,
  setServiceCrashed,
  acknowledgeCurrentAlert,
  setServiceHealthy,
  listServiceIds,
  acknowledgeTimeout
  // setEscalationPolicy
}