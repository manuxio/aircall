import Promise from 'bluebird';
import http from 'http';
import morgan from 'morgan';
import express from 'express';
// const BasicStrategy = passportHttp.BasicStrategy;
import {
  ping,
  services,
} from './routes';

// import routes from '../routes';
import "regenerator-runtime/runtime";
import bodyParser from 'body-parser';
import {
  log,
  config
} from '../../../libs/';


const ApiServer = class {
  constructor() {
    this.express = express();
    this.server = http.createServer(this.express);
  }
  start() {
    log.debug('[API Server] API server start attempt...');
    return Promise.resolve()
      .then(
        () => {
          log.trace('[API Server] Performing preliminary checks like: dbconnections, directory existance... (this is just a placeholder)');
          return Promise.resolve();
        }
      )
      .then((options) => this.configure(options))
      .then(() => {
        return new Promise((resolve, reject) => {
          log.trace(`[API Server] Binding to port ${config.apiPort}`);
          this.server.listen(config.apiPort, (err) => {
            if (err) {
              return reject(err);
            }
            log.trace(`[API Server] Listening on port ${config.apiPort}`);
            resolve(this.express);
          })
        });
      });
  }
  configure(/* options = {} */) {
    // log.trace('Options', options);

    return Promise.resolve()
      .then(() => {
        this.express.use(bodyParser.json({}));
      })
      .then(() => {
        this.express.use(bodyParser.urlencoded({ extended: false }));
      })
      .then(() => {
        this.express.use(morgan('combined'));
      })
      .then(() => {
        this.express.use('/ping', ping);
        this.express.use('/services', services);
        // this.express.use('/user', user);
      });
  }
}
export default ApiServer;