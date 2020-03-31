const Datastore = require("nedb-promises");
let db = Datastore.create({
  filename: "./db/test.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});

const moment = require("moment");
// limit (pagina) skip (pagina *perPage)

const readLogs = async (from, to, skip, limit = 1000) => {
  return new Promise((resolve, reject) => {
    db.find({
      $and: [
        { request_received_at: { $gte: from.toDate() } },
        { request_received_at: { $lte: to.toDate() } }
      ]
    })
      .sort({ request_received_at: 1 })
      .then(logs => {
        resolve(logs);
      })
      .catch(err => reject(err));
  });
};

const readApplicationLogs = async (from, to, applicationName, skip, limit) => {
  return new Promise((resolve, reject) => {
    db.find({
      $and: [
        { request_received_at: { $gte: from.toDate() } },
        { request_received_at: { $lte: to.toDate() } },
        { application_name: applicationName }
      ]
    })
      .sort({ request_received_at: 1 })
      .skip(skip * limit || 0)
      .limit(limit || 1000)
      .then(logs => resolve(logs))
      .catch(err => reject(err));
  });
};
const from = moment().subtract("24", "hours");
const to = moment();

readApplicationLogs(from, to, "express-demo-app", 11, 11).then(logs =>
  console.log("iets", logs.length)
);

module.exports = {
  readApplicationLogs: readApplicationLogs,
  readLogs: readLogs
};
