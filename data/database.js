"use strict";
const DataStore = require("nedb");
const moment = require("moment");
// Persistent datastore with automatic loading
const logsDB = new DataStore({
  filename: "./data/logsDB.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});
const logModel = require("./model/logModel");

// https://github.com/louischatriot/nelogsDB#inserting-documents
// load logsDB

logsDB.loadDatabase();

// zelf bestand compacten?: https://github.com/louischatriot/nelogsDB#persistence
const bulkCreateLog = logsArray => {
  logsDB.insert(logsArray, (err, newDocs) => {
    if (err) throw err;
    console.log(`${newDocs.length} logs inserted.`);
  });
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
const readLogs = (start, end, app_name, limit = 100, skip = 0, callback) => {
  if (app_name) {
    logsDB.find(
      {
        $and: [
          { received_at: { $gte: start } },
          { received_at: { $lte: end } },
          { application_name: app_name }
        ]
      },
      (err, docs) => {
        if (err) throw err;
        // console.log(docs);
        callback(docs);
      }
    );
  }
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
let start = moment("2020-03-1114:16:21.457001923Z", "YYYY-MM-DDTHH:mm:ss.SSS");
console.log(start.toString());
let end = moment();
// readLogs(start, end, "express-demo-app");

// let logs = logsDB.find(
//   {
//     $and: [
//       { request_received_at: { $gte: start.toDate(), $lte: end.toDate() } },

//       { application_name: "express-demo-app" }
//     ]
//     // request_received_at: { $lt: new Date() }
//     // application_name: "express-demo-app"
//   },
//   (err, docs) => {
//     if (err) throw err;

//     console.log(docs);
//     return docs;
//   }
// );

// update document
let log = logsDB.findOne({ _id: "fRPDB3EBUUL1vWPuQ5lO" }, (err, doc) => {
  if (err) throw err;
  console.log(doc);
  const resp = 444;
  logsDB.update(
    { _id: "fRPDB3EBUUL1vWPuQ5lO" },
    { response: resp },
    {},
    (err, numAffected, affectedDocs) => {
      if (err) throw err;
      console.log(`${numAffected} rows updated`);
      console.log(affectedDocs);
    }
  );
});

console.log(log);
module.exports = {
  bulkCreateLog: bulkCreateLog,
  createLog: createLog,
  readLogs: readLogs
};
