import express from 'express';
const router = express.Router();

import aircall from '../../../../application/';

import {
  JsonReply,
  log
} from '../../../../../libs/';



router.post('/:serviceId/crashed', (req, res, next) => {
  const {
    serviceId
  } = req.params;
  const {
    message
  } = req.body;
  return aircall.loadService(serviceId)
    .then(
      (service) => {
        log.debug(`[APISERVER] Service ${serviceId} loaded`);
        return aircall.setServiceCrashed(service, message);
      }
    )
    .then(
      (/* service */) => {
        log.debug(`[APISERVER] Service ${serviceId} marked as crashed`);
        const retval = new JsonReply();
        res.json(retval);
      }
    )
    .catch(
      (e) => {
        log.error(e);
        next(e);
      }
    )
});

router.get('/:serviceId/acknowledge', (req, res, next) => {
  const {
    serviceId
  } = req.params;
  return aircall.loadService(serviceId)
    .then(
      (service) => {
        log.debug(`[APISERVER] Service ${serviceId} loaded`);
        return aircall.acknowledgeCurrentAlert(service);
      }
    )
    .then(
      (/* service */) => {
        log.debug(`[APISERVER] Service ${serviceId} alert was acknowledged`);
        const retval = new JsonReply();
        res.json(retval);
      }
    )
    .catch(
      (e) => {
        log.error(e);
        next(e);
      }
    )
});

router.get('/:serviceId/healthy', (req, res, next) => {
  const {
    serviceId
  } = req.params;
  return aircall.loadService(serviceId)
    .then(
      (service) => {
        log.debug(`[APISERVER] Service ${serviceId} loaded`);
        return aircall.setServiceHealthy(service);
      }
    )
    .then(
      (/* service */) => {
        log.debug(`[APISERVER] Service ${serviceId} was set healthy`);
        const retval = new JsonReply();
        res.json(retval);
      }
    )
    .catch(
      (e) => {
        log.error(e);
        next(e);
      }
    )
});

export default router;