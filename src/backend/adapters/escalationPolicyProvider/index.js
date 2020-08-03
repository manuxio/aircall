import Promise from 'bluebird';
import { promises as fs } from "fs";
import {
  config,
  log
} from '../../../libs';

const getRecordById = async (recordId, suppressLog = false) => {
  const {
    policyDir
  } = config;
  return fs.readFile(`${process.cwd()}/${policyDir}/${recordId}.json`, 'utf8')
    .then(
      (data) => {
        return JSON.parse(data.toString());
      }
    )
    .catch(
      (e) => {
        if (!suppressLog) {
          log.error(`[POLICY PROVIDER] An error occurred while accessing the path or file: ${process.cwd()}/${policyDir}/${recordId}.json`, e);
        }
        return Promise.reject(e);
      }
    );
}

const createOrUpdateRecordById = async (recordId, object = null) => {
  const {
    policyDir
  } = config;
  // console.log('baseService', baseService, service || baseService);
  const data = Object.assign({}, object, {
    id: recordId
  });
  return fs.open(`${process.cwd()}/${policyDir}/${recordId}.json`, 'w')
    .then(
      (fd) => fs.writeFile(fd, JSON.stringify(data)).then(() => fd.close(fd))
    )
    .then(
      () => data
    )
    .catch(
      (e) => {
        log.error(`[POLICY PROVIDER] An error occurred while accessing the path or file: ${process.cwd()}/${policyDir}/${recordId}.json`, e);
        return false;
      }
    );
}

export default {
  getRecordById,
  createOrUpdateRecordById
}