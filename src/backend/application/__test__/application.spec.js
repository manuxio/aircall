import "babel-polyfill";
import Promise from 'bluebird';
import db from '../../adapters/persistence';
import policyHelpers from '../policyHelpers';
import escalationPolicyProvider from '../../adapters/escalationPolicyProvider';
import smsSend from '../../adapters/smsdispatcher';
import emailSend from '../../adapters/emaildispatcher';
import timer from '../../adapters/timeradapter';
import aircall from '../index';

jest.mock('../../adapters/emaildispatcher');
jest.mock('../../adapters/smsdispatcher');
jest.mock('../../adapters/timeradapter');
const dummyServiceId = 'myDummyService';

describe("Application use cases", () => {
  it('Load Dummy Service', async () => {
    await db.deleteRecordById(dummyServiceId);
    let service = await aircall.loadService(dummyServiceId);
    expect(typeof service).toBe('object');
    const policy = await escalationPolicyProvider.getRecordById(service.escalationPolicyId);
    expect(typeof policy).toBe('object');
    // const maxLevel = policyHelpers.getPolicyMaxLevel(policy);
    const policyLevelKeys = Object.keys(policy.levels);

    // expect(policy.name).toBe('Default policy');
    expect(service.id).toBe(dummyServiceId);
    expect(service.escalationPolicyId).toBe('default');
    const allServiceIds = await aircall.listServiceIds();
    expect(allServiceIds).toContain(dummyServiceId);

    service = await aircall.loadService(dummyServiceId);
    service = await aircall.setServiceCrashed(service, 'Not an useful message');
    let smsCount = 0;
    let mailCount = 0;
    let timerCount = 0;

    // console.log('policyLevelKeys', policyLevelKeys, policy);
    // expect(smsSend).toHaveBeenCalledTimes(1);
    // console.log('policy.levels[k].phoneNumbers', policy.levels['0'].phoneNumbers.length);

    await Promise.mapSeries(policyLevelKeys, async (k) => {
      service = await aircall.loadService(service.id);
      const kAsInt = parseInt(k, 10);
      // console.log('Loop', kAsInt);
      // console.log('service.currentAlert.level', service.currentAlert);
      expect(service.currentAlert.level).toBe(kAsInt);
      smsCount += policy.levels[k].phoneNumbers.length;
      mailCount += policy.levels[k].mailAddresses.length;
      expect(smsSend).toHaveBeenCalledTimes(smsCount);
      expect(emailSend).toHaveBeenCalledTimes(mailCount);
      if (policy.levels[k].acknowledgeTimeout > 0) {
        timerCount += 1;
        expect(timer).toHaveBeenCalledTimes(timerCount);
        await aircall.acknowledgeTimeout(service.id);
      }
    });

    // expect(service.healthy).toBe(false);
    // expect(smsSend).toHaveBeenCalledTimes(1);
    // expect(emailSend).toHaveBeenCalledTimes(1);
    // expect(timer).toHaveBeenCalledTimes(1);
    // await aircall.acknowledgeTimeout(service.id, policy);
    // service = await aircall.loadService(dummyServiceId);
    // expect(service.currentAlert.level).toBe(1);
    // expect(smsSend).toHaveBeenCalledTimes(2);
    // expect(emailSend).toHaveBeenCalledTimes(2);
    // expect(timer).toHaveBeenCalledTimes(2);

    // service = await aircall.loadService(dummyServiceId);

    // expect(await aircall.setServiceCrashed.bind(null, service, 'Not very useful')).not.toThrow();
    // service = await aircall.loadService(dummyServiceId);
    // expect(service.healthy).toBe(false);
    // service = await aircall.loadService(dummyServiceId);
    // expect(await aircall.setServiceHealthy.bind(null, service)).not.toThrow();
    // service = await aircall.loadService(dummyServiceId);
    // expect(service.healthy).toBe(true);
  });
});

