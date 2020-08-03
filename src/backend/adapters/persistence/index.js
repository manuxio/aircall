import Promise from 'bluebird';
import { promises as fs } from "fs";
import {
  config,
  log
} from '../../../libs';

const getRecordById = async (serviceId, suppressLog = false) => {
  const {
    dataDir
  } = config;
  return fs.readFile(`${process.cwd()}/${dataDir}/${serviceId}.json`, 'utf8')
    .then(
      (data) => {
        return JSON.parse(data.toString());
      }
    )
    .catch(
      (e) => {
        if (!suppressLog) {
          log.error(`[PERSISTENCE] getRecordById: An error occurred while accessing the path or file: ${process.cwd()}/${dataDir}/${serviceId}.json`, e);
        }
        return Promise.reject(e);
      }
    );
}

const deleteRecordById = async (serviceId) => {
  const {
    dataDir
  } = config;
  return fs.unlink(`${process.cwd()}/${dataDir}/${serviceId}.json`)
    .catch(
      (e) => {
        if (e && e.code === 'ENOENT') {
          return Promise.resolve();
        }
        return Promise.reject(e);
      }
    );
}

const getAllRecordIds = async () => {
  const {
    dataDir
  } = config;
  return fs.readdir(`${process.cwd()}/${dataDir}/`)
    .then(
      (files) => {
        return files.filter((f) => f.indexOf('.json') > -1).map((f) => f.replace('.json', ''))
      }
    )
    .catch(
      (e) => {
        log.error(`[PERSISTENCE] getRecordById: An error occurred while accessing the path or file: ${process.cwd()}/${dataDir}`, e);
        return Promise.reject(e);
      }
    );
}

const createOrUpdateRecordById = async (serviceId, service = null) => {
  const {
    dataDir
  } = config;
  // console.log('baseService', baseService, service || baseService);
  const data = Object.assign({}, service, {
    id: serviceId
  });
  return fs.open(`${process.cwd()}/${dataDir}/${serviceId}.json`, 'w')
    .then(
      (fd) => fs.writeFile(fd, JSON.stringify(data)).then(() => fd.close(fd))
    )
    .then(
      () => data
    )
    .catch(
      (e) => {
        log.error(`[PERSISTENCE] createOrUpdateRecordById: An error occurred while accessing the path or file: ${process.cwd()}/${dataDir}/${serviceId}.json`, e);
        return false;
      }
    );
}

export default {
  getRecordById,
  createOrUpdateRecordById,
  getAllRecordIds,
  deleteRecordById
}