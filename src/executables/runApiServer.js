import {
  ApiServer
} from '../backend/adapters/apiserver';
import {
  log
} from '../libs/';

const theServer = new ApiServer();
theServer.start()
  .then(() => {
    log.debug('[API Server] All setup!');
  });