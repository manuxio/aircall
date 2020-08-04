import Promise from 'bluebird';
import app from 'commander';
import { Table } from 'console-table-printer';
import aircall from '../../application/';

// import {
//   log
// } from '../../../libs/';

import moment from 'moment';

const ConsoleClient = class {
  constructor() {

    app
    .command('list-services') // sub-command name
    .alias('ls') // alternative sub-command is `al`
    .description('List all services') // command description
    .action(async () => {
      // console.log(serviceIds);
      return Promise.resolve()
        .then(
          () => aircall.listServiceIds()
        )
        .then(
          (serviceIds) => Promise.mapSeries(serviceIds, (serviceId) => {
            return aircall.loadService(serviceId);
          })
        )
        .then(
          (services) => Promise.reduce(services, (table, service) => {
            const myObject = {
              ID: service.id,
              Name: service.name,
              'Policy ID': service.escalationPolicyId,
              State: service.healthy ? 'OK' : 'NOK',
              Crashed: service.healthy ? '' : moment(service.currentAlert.alertTime).format('YY/MM/DD HH:mm:ss'),
              Message: service.healthy ? '' : `${service.currentAlert.message.substring(0, 10)}...`,
              Level: service.healthy ? '' : service.currentAlert.level,
              Ack: service.healthy ? '' : (service.currentAlert.acknowledged ? 'YES' : 'NO'),
            }
            const options = {
              color: 'green'
            }
            if (!service.healthy) {
              options.color = 'red';
              if (service.currentAlert.acknowledged) {
                options.color = 'yellow';
              }
            }
            table.addRow(myObject, options);
            return table;
          }, new Table())
        )
        .then(
          (table) => table.printTable()
        );

    });

    app
    .command('service <serviceId>')
    .description('Manipulate service')
    .option('-s, --state [value]', 'Set service state', '')
    .option('-m, --message [value]', 'Set service crash message', '')
    .option('-a, --ack', 'Acknowledge the current alert')
    .action(async (serviceId, options) => {
      // console.log('Service ID', serviceId);
      return Promise.resolve()
        .then(
          () => aircall.loadService(serviceId)
        )
        .then(
          (service) => {
            if (options.state) {
              if (options.state === 'ok') {
                return aircall.setServiceHealthy(service);
              }
              if (options.state === 'nok') {
                if (options.message === '') {
                  return Promise.reject(new Error('Please add a valid crash message'));
                } else {
                  return aircall.setServiceCrashed(service, options.message)
                }
              }
            } else {
              if (options.ack && !service.healthy && !service.currentAlert.acknowledged) {
                return aircall.acknowledgeCurrentAlert(service);
              }
            }
            // return args.state === 'healthy' ? aircall.setServiceHealthy(service) : aircall.setServiceCrashed()
            return service;
          }
        )
    })
  }
  start() {
    app.parse(process.argv);
  }
}
export default ConsoleClient;