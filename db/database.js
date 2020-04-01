"use strict";
const DataStore = require("nedb");
const moment = require("moment");
// Persistent datastore with automatic loading
const logsDB = new DataStore({
  filename: "./db/logsdb.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});

// https://github.com/louischatriot/nelogsDB#inserting-documents
// load logsDB

logsDB.loadDatabase();
/**
 * @deprecated heel het bestand eigenlijk
 * @param {} logsArray 
 */
// zelf bestand compacten?: https://github.com/louischatriot/nelogsDB#persistence
const bulkCreateLogs = logsArray => {
  return new Promise((resolve, reject) => {
    // zoek eerst op documenten die reeds al bestaand
    const ids = logsArray.map(log => log._id);
    logsDB.find({ _id: { $in: ids } }, (err, docs) => {
      if (err) throw err;
      // verwijder de reeds bestaande documenten uit de logsArray
      let newLogs = logsArray.filter(log => {
        for (let doc of docs) {
          if (doc._id === log._id) return false;
        }
        return true;
      });
      // console.log(docs);
      logsDB.insert(newLogs, (err, newDocs) => {
        if (err) console.log(err);
        if (newDocs === undefined) {
          console.log(`0 logs inserted.`);
          resolve(0);
        } else {
          console.log(`${newDocs.length || 0} logs inserted.`);
          resolve(newDocs);
        }
      });
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
          console.log(numOfUpdates, "rows updated");
        }
      );
    } catch (e) {
      console.log(e);
    }
  }
  logsDB.persistence.compactDatafile();
};

const createLog = logObject => {
  logsDB.insert(logObject, (err, newDoc) => {
    if (err) throw err;
    console.log(newDoc);
    console.log(`log with id ${newDoc._id} has been inserted`);
  });
};

const removeExpiredLogs = expirationDate => {
  logsDB.remove(
    { request_received_at: { $lte: expirationDate.toDate() } },
    {},
    (err, num) => {
      if (err) throw err;
      console.log(`${num} logs removed.`);
    }
  );
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
const readLogs = (start, end) => {
    
  logsDB
    .find({
      $and: [
        { request_received_at: { $gte: start.toDate() } },
        { request_received_at: { $lte: end.toDate() } }
        // { application_name: app_name }
      ]
    })
    .sort({ request_received_at: 1 })
    .exec((err, docs) => {
      if (err) throw err;
      // console.log(docs);
      console.log(docs.length, " logs found.");
      return docs;
    });

};

const from = moment().subtract("24", "hours");
const to = moment();
const callback = logs => {
  console.log(logs);
};
// const logs = readLogs(from, to);
module.exports = {
  bulkCreateLog: bulkCreateLogs,
  // createLog: createLog,
  readLogs: readLogs,
  bulkUpdateLogs: bulkUpdateLogs,
  removeExpiredLogs: removeExpiredLogs
};
