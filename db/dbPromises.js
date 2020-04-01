const path = require("path");
const filePath = path.join(__dirname, "logsdb.ndjson");

const Datastore = require("nedb-promises");
let db = Datastore.create({
  inMemoryOnly: true, 
  // filename: filePath,
  autoload: true,
  timestampData: false,
  corruptAlertThreshold: 1
});
console.log(filePath);
// db.load();

const bulkCreateLogs = async logsArray => {
  return new Promise((resolve, reject) => {
    try {
      // zoek eerst op documenten die reeds al bestaand
      const ids = logsArray.map(log => log._id);
      db.find({ _id: { $in: ids } }).then(foundLogs => {
        // verwijder de reeds bestaande documenten uit de logsArray
        let newLogs = logsArray.filter(log => {
          for (let doc of foundLogs) {
            if (doc._id === log._id) return false;
          }
          return true;
        });

        // console.log("bestaande logs: ", foundLogs);
        // console.log("nieuwe logs: ", newLogs);

        // voeg nieuwe logs aan datastore:
        db.insert(newLogs).then((err, insertedLogs) => {
          if (err) {
            return reject(err);
          }
          if (insertedLogs === undefined || insertedLogs.length === 0) {
            console.log("0 logs inserted");
            return resolve(null);
          }
          console.log(`${insertedLogs.length} logs inserted.`);
          return resolve(insertedLogs);
        });
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

const bulkUpdateLogs = async logsArray => {
  let promiseArray = [];
  for (let log of logsArray) {
    try {
      let promise = new Promise((resolve, reject) => {
        db.update(
          { _id: log._id },
          {
            $set: {
              simulatedResponse: log.simulatedResponse,
              simulated: true
            }
          }
        )
          .then(numOfUpdates => {
            resolve(numOfUpdates);
            // console.log(numOfUpdates, "rows updated");
          })
          .catch(e => {
            throw e;
          });
      });
      promiseArray.push(promise);
    } catch (e) {
      console.log(e);
    }
  }
  Promise.all(promiseArray).then(values => {
    if (values.length > 0) {
      const totalUpdates = values.reduce(
        (prevVal, currVal) => prevVal + currVal
      );
      console.log(`${totalUpdates} rows updated.`);
    }
  });
  db.persistence.compactDatafile();
};
const moment = require("moment");

// limit (pagina) skip (pagina *perPage)
const readLogs = async (from, to, skip, limit) => {
  return new Promise((resolve, reject) => {
    db.find({
      $and: [
        { request_received_at: { $gte: from.toDate() } },
        { request_received_at: { $lte: to.toDate() } }
      ]
    })
      .sort({ request_received_at: 1 })
      .skip(skip * limit || 0)
      .limit(limit || 1000)
      .then(logs => {
        return resolve(logs);
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
      .then(logs => {
        console.log(logs);
        resolve(logs);
      })
      .catch(err => reject(err));
  });
};

const countLogs = async (from, to) => {
  return new Promise((resolve, reject) => {
    let query = {};
    if (from && to) {
      query = {
        $and: [
          {
            request_received_at: {
              $gte: from.toDate()
            }
          },
          {
            request_received_at: {
              $lte: to.toDate()
            }
          }
        ]
      };
    }
    try {
      db.count(query).then(numofLogs => {
        return resolve(numofLogs);
      });
    } catch (e) {
      reject(e);
      throw e;
    }
  });
};

const removeExpiredLogs = expirationDate => {
  try {
    logsDB
      .remove({
        request_received_at: {
          $lte: expirationDate.toDate()
        }
      })
      .then(numOfLogsRemoved => {
        if (numOfLogsRemoved > 0)
          console.log(`${numOfLogsRemoved} logs removed.`);
        else {
          console.log("no logs have been removed");
        }
      });
  } catch (e) {
    throw e;
  }
};

const from = moment().subtract("24", "hours");
const to = moment();

// readApplicationLogs(from, to, "express-demo-app", 11, 11).then(logs =>
//   console.log("iets", logs.length)
// );
const start = moment("2020-01-01T12:00:00", "YYYY-MM-DDTHH:mm:ss");
const end = moment();
// readLogs(start, end).then(l => console.log(logs));

module.exports = {
  readApplicationLogs: readApplicationLogs,
  readLogs: readLogs,
  bulkCreateLogs: bulkCreateLogs,
  bulkUpdateLogs: bulkUpdateLogs,
  removeExpiredLogs: removeExpiredLogs,
  countLogs: countLogs,
  db: db
};
