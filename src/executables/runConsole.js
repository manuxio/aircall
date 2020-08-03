import ConsoleClient from '../backend/adapters/consoleclient';
import {
  log
} from '../libs/';

const theServer = new ConsoleClient();
theServer.start();