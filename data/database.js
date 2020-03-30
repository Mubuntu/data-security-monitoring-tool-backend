"use strict";
const DataStore = require("nedb");
const moment = require("moment");
// Persistent datastore with automatic loading
const logsDB = new DataStore({
  filename: "./data/logdb.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});
const logModel = require("./model/logModel");

// https://github.com/louischatriot/nelogsDB#inserting-documents
// load logsDB

logsDB.loadDatabase();

// zelf bestand compacten?: https://github.com/louischatriot/nelogsDB#persistence
const bulkCreateLogs = logsArray => {
  return new Promise((resolve, reject) => {
    logsDB.insert(logsArray, (err, newDocs) => {
      if (err) console.log(err);
      if (newDocs === undefined) {
        console.log(`0 logs inserted.`);
        resolve(0);
      } else {
        console.log(`${newDocs.length || 0} logs inserted.`);
        resolve(newDocs);
      }
      logsDB.persistence.compactDatafile();
    });
  });
};

const bulkUpdateLogs = logsArray => {
  let numAffected = 0;

  for (let log of logsArray) {
    try {
      logsDB.update(
        { _id: log._id },
        { $set: { simulatedResponse: log.simulatedResponse, simulated: true } },
        {},
        (err, numOfUpdates) => {
          if (err) throw err;
          numAffected += numOfUpdates;
          // console.log(numOfUpdates, "rows updated");
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
  logsDB.persistence.compactDatafile();
};

const createLog = logObject => {
  // let aLog  = {
  //   application_name: application_name,
  //   host: host,
  //   path: path,

  // }
  logsDB.insert(logObject, (err, newDoc) => {
    if (err) throw err;
    console.log(newDoc);
    console.log(`log with id ${newDoc._id} has been inserted`);
  });
};

/**
 * *
 * A logModel
 *@typedef {Object} LogModel
 * @property {String} id a unique identifier
 * * @property {String} application_name
 * @property {String} domain name of the application
 * @property {String} path path to resource
 * @property {String} method HTTP Method
 * @property {String} protocol
 * @property {Number} response_status status code of the response
 * @property {String} response_content_type
 * @property {String} organization_name organisation name in Cloud Foundry
 * @property {String} space_name space name in Cloud Foundry
 * @property {String} logging_service_name name of the logging service bound to the application
 * @property {String} user_agent user agent used to make the the API call
 * @property {Date} received_at date and time on which the request was received as an ISO String
 * @property {Date} response_sent_at
 * @property {String} level logging layer from which the log is emitted
 * @property {String} type log type (can be either log, trace or request)
 *
 *
 */

/**
 *
 * @param {LogModel} logObject
 * @param {ISOString} start
 * @param {Date.ISOString()} end
 * @param {String} app_name
 * @param {*} limit
 * @param {*} skip
 */
// date moet een isoString zijn dus moment().toIsoDate()
const readLogs = (start, end, callback) => {
  logsDB.find(
    {
      $and: [
        { request_received_at: { $gte: start } },
        { request_received_at: { $lte: end } }
        // { application_name: app_name }
      ]
    },
    (err, docs) => {
      if (err) throw err;
      // console.log(docs);
      callback(docs);
    }
  );
};

const aLog = {
  application_name: "express-demo-app",
  host: "-",
  _id: "aODmz3ABOhZ3W8frk0Y6",
  path: "/login",
  extra_headers: "-",
  remote_port: "-",
  method: "GET",
  remote_ip: "-",
  protocol: "HTTP/1.1",
  response_status: 200,
  response_content_type: "-",
  organization_name: "AmistaDEV",
  space_name: "dev",
  logging_service_name: "express-demo-logs",
  service_name: "application-logs",
  dest_ip_and_port: "10.0.137.195:61043",
  user_agent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
  request_received_at: moment(
    "2020-03-11T14:16:21.457001923Z",
    "YYYY-MM-DDTHH:mm:ss.SSS"
  ).toDate(),
  response_sent_at: moment(
    "2020-03-11T14:16:21.478Z",
    "YYYY-MM-DDTHH:mm:ss.SSS"
  ),
  remote_user: "-",
  level: "INFO",
  layer: "[CF.RTR]",
  referer:
    "https://express-demo-app-relaxed-wolf-mx.cfapps.eu10.hana.ondemand.com/",
  type: "10.0.137.195:61043"
};
// createLog(aLog)
// 2020-03-11T14:16:2 1.457001923Z
// let start = moment("2020-03-1114:16:21.457001923Z", "YYYY-MM-DDTHH:mm:ss.SSS");
// console.log(start.toString());
// let end = moment();

// let updatedLog = {
//   simulatedResponse: {
//     status: 200,
//     statusText: "OK",
//     url:
//       "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/users",
//     method: "get",
//     headers: {
//       "content-length": "780",
//       "content-type": "application/json; charset=utf-8",
//       date: "Mon, 30 Mar 2020 12:41:32 GMT",
//       etag: 'W/"30c-kMwshdP43OKpmUsx8OqbMc/3CHI"',
//       "x-powered-by": "Express",
//       "x-vcap-request-id": "13a7c521-b4a9-451b-4745-1a170139446f",
//       connection: "close",
//       "strict-transport-security":
//         "max-age=31536000; includeSubDomains; preload;"
//     }
//   }
// };
// let arr = [];
// arr.push(updatedLog);
// bulkUpdateLogs(arr);
// console.log(log);

const from = moment()
  .subtract("7", "days")
  .toDate();
const to = moment().toDate();
const callback = logs => {
  console.log(logs);
};
// readLogs(from, to, callback)
module.exports = {
  bulkCreateLog: bulkCreateLogs,
  // createLog: createLog,
  readLogs: readLogs,
  bulkUpdateLogs: bulkUpdateLogs
};
