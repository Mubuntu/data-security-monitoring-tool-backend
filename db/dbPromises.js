const path = require("path");
const filePath = path.join(__dirname, "logsdb.ndjson");
const filePathWhiteList = path.join(__dirname, "whitelistDb.ndjson");

const localStorePath = path.join(__dirname, "logsdb.json");

const { readFile, writeFile } = require("../utils/helperMethods");
const Datastore = require("nedb-promises");
// let db = Datastore.create(
//   // {
//   //   inMemoryOnly: false,
//   //   // filename: filePath,
//   //   autoload: true,
//   //   timestampData: false,
//   //   corruptAlertThreshold: 1,
//   // }
// );
let db = {};
db.logs = new Datastore({
  inMemoryOnly: false,
  filename: filePath,
  autoload: true,
  timestampData: false,
  corruptAlertThreshold: 1,
});
db.whitelist = new Datastore({
  inMemoryOnly: false,
  filename: filePathWhiteList,
  autoload: true,
  timestampData: false,
  corruptAlertThreshold: 1,
});
// haal alle gegevens op
// console.log(filePath);

db.logs.load();
// db.persistence.setAutocompactionInterval(5);
//laad ggegevens bij initialisatie  db:
const initialiseDB = async () => {
  try {
    readFile(
      async (data) => {
        await db.logs
          .insert(data)
          .then((insertedLogs) => {
            if (insertedLogs === undefined || insertedLogs.length === 0) {
              console.log("0 logs inserted");
              return;
            }
            console.log(`${insertedLogs.length} logs inserted into db.`);
          })
          .catch(console.log);
      },
      true,
      localStorePath
    );
    // await fs.readFile(localStorePath, "utf-8").then(async (data) => {
    //   const logs = JSON.parse(data);
    //   await db
    //     .insert(logs)
    //     .then((insertedLogs) => {
    //       if (insertedLogs === undefined || insertedLogs.length === 0) {
    //         console.log("0 logs inserted");
    //         return;
    //       }

    //       console.log(`${insertedLogs.length} logs inserted.`);
    //       // return;
    //     })
    //     .catch(console.log);
    //   // await db.count().then(console.log).catch(console.log); // om te testen
    // });
  } catch (err) {
    console.log(err);
  }
};
// schrijft alle logs naar een bestand
const updateDB = () => {
  db.logs.find().then((foundLogs) => {
    if (foundLogs.length > 0)
      writeFile(
        JSON.stringify(foundLogs, null, 2),
        () => {
          console.log("updated logs in local file");
        },
        localStorePath
      );
  });
};
const bulkCreateLogs = async (logsArray) => {
  return new Promise((resolve, reject) => {
    try {
      // zoek eerst op documenten die reeds al bestaand
      const ids = logsArray.map((log) => log._id);
      db.logs.find({ _id: { $in: ids } }).then((foundLogs) => {
        // verwijder de reeds bestaande documenten uit de logsArray
        let newLogs = logsArray.filter((log) => {
          for (let doc of foundLogs) {
            if (doc._id === log._id) return false;
          }
          return true;
        });

        // console.log("bestaande logs: ", foundLogs);
        // console.log("nieuwe logs: ", newLogs);

        // voeg nieuwe logs aan datastore:
        db.logs
          .insert(newLogs)
          .then((insertedLogs) => {
            if (insertedLogs === undefined || insertedLogs.length === 0) {
              console.log("0 logs inserted");
              return resolve(null);
            }

            console.log(`${insertedLogs.length} logs inserted.`);
            return resolve(insertedLogs);
          })
          .catch((err) => {
            reject(err);
            throw err;
          });
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

const bulkUpdateLogs = async (logsArray) => {
  let promiseArray = [];
  for (let log of logsArray) {
    try {
      let promise = new Promise((resolve, reject) => {
        db.logs
          .update(
            { _id: log._id },
            {
              $set: {
                simulatedResponse: log.simulatedResponse,
                simulated: true,
              },
            }
          )
          .then((numOfUpdates) => {
            // console.log(numOfUpdates, "rows updated");
            resolve(numOfUpdates);
          })
          .catch((e) => {
            throw e;
          });
      });
      promiseArray.push(promise);
    } catch (e) {
      console.log(e);
    }
  }
  Promise.all(promiseArray).then((values) => {
    if (values.length > 0) {
      const totalUpdates = values.reduce(
        (prevVal, currVal) => prevVal + currVal
      );
      console.log(`${totalUpdates} rows updated.`);
      updateDB();
    }
  });
  // db.logs.persistence.compactDatafile();
};
const moment = require("moment");

// limit (pagina) skip (pagina *perPage)
const readLogs = (from, to, skip, limit, response) => {
  return new Promise(async (resolve, reject) => {
    let query = {
      $and: [
        { request_received_at: { $gte: from.toDate() } },
        { request_received_at: { $lte: to.toDate() } },
      ],
    };
    if (typeof response === "boolean") {
      query = {
        $and: [
          { request_received_at: { $gte: from.toDate() } },
          { request_received_at: { $lte: to.toDate() } },
          { simulated: response },
        ],
      };
    }
    // console.log(query);
    await db.logs
      .find(query)
      // .sort({ request_received_at: 1 })
      // .skip(skip * limit || 0)
      // .limit(limit || 0)
      .then((logs) => {
        // console.log(logs.length);
        return resolve(logs);
      })
      .catch((err) => reject(err));
  });
};

const readApplicationLogs = async (
  from,
  to,
  applicationName,
  skip,
  limit,
  response
) => {
  return new Promise((resolve, reject) => {
    let query = {
      $and: [
        { request_received_at: { $gte: from.toDate() } },
        { request_received_at: { $lte: to.toDate() } },
        { application_name: applicationName },
      ],
    };
    if (typeof response === "boolean") {
      query = {
        $and: [
          { request_received_at: { $gte: from.toDate() } },
          { request_received_at: { $lte: to.toDate() } },
          { simulated: response },
        ],
      };
    }
    db.logs
      .find(query)
      .sort({ request_received_at: 1 })
      .skip(skip * limit || 0)
      .limit(limit || 1000)
      .then((logs) => {
        console.log(logs);
        resolve(logs);
      })
      .catch((err) => reject(err));
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
              $gte: from.toDate(),
            },
          },
          {
            request_received_at: {
              $lte: to.toDate(),
            },
          },
        ],
      };
    }
    try {
      db.logs.count(query).then((numofLogs) => {
        return resolve(numofLogs);
      });
    } catch (e) {
      reject(e);
      throw e;
    }
  });
};

const removeExpiredLogs = (expirationDate) => {
  try {
    db.logs
      .remove({
        request_received_at: {
          $lte: expirationDate.toDate(),
        },
      })
      .then((numOfLogsRemoved) => {
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

/**
 *  Insert a single new whitelist object
 */

const insertWhitelist = (whitelist) => {
  return new Promise((resolve, reject) => {
    try {
      var isArray = false;
      let query = {};
      if (typeof whitelist === "object" && whitelist.length > 0) {
        isArray = true;
        var queryArray = [];
        whitelist.forEach((w) => {
          var queryItem = {
            userId: w.userId,
            appName: w.appName,
            path: w.path,
          };
          queryArray.push(queryItem);
        });

        query = { $or: queryArray };
      } else {
        query = {
          $and: [
            { userId: whitelist.userId },
            { appName: whitelist.appName },
            { path: whitelist.path },
          ],
        };
      }
      // eerst zoeken of whitelist alvast al bestaat.
      db.whitelist
        .find(query)
        .then((foundWhitelistings) => {
          if (foundWhitelistings.length > 0) {
            if (typeof whitelist === "object" && !isArray) {
              return reject(new Error("whitelist object exists already."));
            } else if (whitelist.length === foundWhitelistings.length) {
              return reject(
                new Error("whitelist objects  already exist in DB.")
              );
            } else if (foundWhitelistings.length < whitelist.length) {
              // remove whitelists that have been found from the new array list that will be inserted:
              whitelist = whitelist.filter((w) => {
                var isNotcreated = true;
                foundWhitelistings.forEach((fw) => {
                  if (
                    w.appName === fw.appName &&
                    w.path === fw.path &&
                    w.userId === fw.userId
                  ) {
                    isNotcreated = false;
                    return;
                  }
                });
                return isNotcreated;
              });
            }
          }
          
          db.whitelist
            .insert(whitelist)
            .then((insertedWhitelist) => {
              // if (
              //   insertedWhitelist === undefined ||
              //   insertedWhitelist.length === 0
              // ) {
              //   console.log("0 whitelists inserted");
              //   return resolve([]);
              // }
              if (Number.isInteger(insertedWhitelist.length)) {
                console.log(
                  ` ${insertedWhitelist.length} whitelist objects have been created.`
                );
              } else {
                console.log(
                  `whitelist with id: ${insertedWhitelist._id} has been inserted.`
                );
              }

              return resolve(insertedWhitelist);
            })
            .catch((err) => {
              const errorType = err.errorType;
              if (errorType === "uniqueViolated") {
                return reject(err.message);
              }

              throw err;
            });
        })
        .catch((err) => {
          // if(err.message === "whitelist object exists already."){
          //   return reject(err);
          // }
          throw err;
        });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

/**
 *  update a new whitelist object based on userId
 */
const updateWhitelist = async (whitelist) => {
  return new Promise((resolve, reject) => {
    try {
      db.whitelist
        .update({ _id: whitelist._id }, whitelist)
        .then((numOfUpdates) => {
          if (numOfUpdates == 0)
            return reject({ message: `${numOfUpdates} rows updated.` });
          console.log(
            `whitelist object with id ${whitelist._id} has been updated.`
          );
          return resolve(numOfUpdates);
        })

        .catch((err) => {
          reject(err);
          throw err;
        });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

/**
 *  delete a  whitelist object based dit moet worden aangepast zodat ge enkel een object Id moet meegeven.
 */
const deleteWhitelist = async ({ _id, userId }) => {
  return new Promise((resolve, reject) => {
    try {
      db.whitelist
        .remove({ $and: [{ _id: _id }, { userId: userId }] })
        // .remove({ $and: [{userId: whitelist.userId }, {appName: whitelist.appName}, {path: whitelist.path}]})
        .then((numOfWhitelistRemoved) => {
          if (numOfWhitelistRemoved > 0) {
            console.log(` whitelist object with id ${_id} has been removed.`);
            return resolve(numOfWhitelistRemoved);
          } else {
            console.log("no whitelist object has been removed");
            resolve(0);
          }
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

/**
 *  returns whitelist list based on userId
 */
const bulkReadWhitelistByUserId = async (userId) => {
  return new Promise((resolve, reject) => {
    try {
      db.whitelist
        .find({ userId: userId })
        .then((foundWhitelistings) => {
          console.log(`${foundWhitelistings.length} whitelist objects found.`);
          return resolve(foundWhitelistings);
        })
        .catch((err) => {
          throw err;
        });
    } catch (e) {
      console.log(e);
      throw e;
    }
  });
};

const from = moment().subtract("24", "hours");
const to = moment();

// readApplicationLogs(from, to, "express-demo-app", 11, 11).then(logs =>
//   console.log("iets", logs.length)
// );
// const start = moment("2020-01-01T12:00:00", "YYYY-MM-DDTHH:mm:ss");
const start = moment().subtract("30", "days");

const end = moment();

// readLogs(start, end)
// .then((logs) => {
//   console.log(logs);
// })
// .catch(console.log);

const list = [
  {
    // _id: "1T34ynEBPfFKXLS153g5",
    appName: "express-demo-app",
    path: "/",
    userId: "P2002249295",
  },
  {
    // _id: "1T34ynEBPfFKXLS153g3",
    appName: "express-demo-app",
    path: "/handig",
    userId: "P2002249295",
  },
  {
    // _id: "1T34ynEBPfFKXLS153g9",
    appName: "express-dummy-app",
    path: "/logs",
    userId: "P2002249295",
  },
  {
    // _id: "1T34ynEBPfFKXLS153g8",
    appName: "express-demo-app",
    path: "/cats",
    userId: "P2002249295",
  },
  {
    // _id: "1T34ynEBPfFKXLS153g6",
    appName: "express-alt-app",
    path: "/dogs",
    userId: "P2002249295",
  },
  {
    // _id: "1T34ynEBPfFKXLS153g7",
    appName: "express-alt-app",
    path: "/vreemd",
    userId: "P2002249295",
  },
];
const updatedWhitelist = {
  _id: "1T34ynEBPfFKXLS153g5",
  appName: "express-demo-app",
  path: "/eenAnderPath",
  userId: "P2002249295",
};
// for(l of list){
//   insertWhiteList(l).then(w=> console.log(w)).catch(errorMessage=>console.log(errorMessage));

// }
// updateWhiteList(updatedWhitelist)
//   .then((w) => console.log(w))
//   .catch((errorMessage) => console.log(errorMessage));
// bulkReadWhiteListByUserId("P2002249295").then(w=> console.log(w)).catch(errorMessage=>console.log(errorMessage));

// deleteWhitelist( {
//   // _id: "1T34ynEBPfFKXLS153g5",
//   appName: "express-demo-app",
//   path: "/",
//   userId: "P2002249295",
// })
module.exports = {
  updateDB: updateDB,
  initialiseDB: initialiseDB,
  readApplicationLogs: readApplicationLogs,
  readLogs: readLogs,
  bulkCreateLogs: bulkCreateLogs,
  bulkUpdateLogs: bulkUpdateLogs,
  removeExpiredLogs: removeExpiredLogs,
  countLogs: countLogs,
  bulkReadWhitelistByUserId: bulkReadWhitelistByUserId,
  deleteWhitelist: deleteWhitelist,
  updatedWhitelist: updateWhitelist,
  insertWhitelist: insertWhitelist,
  db: db,
};
