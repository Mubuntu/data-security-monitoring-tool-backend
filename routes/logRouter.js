"use strict";
var express = require("express");
var router = express.Router();
const dataStore = require("../db/dbPromises");
const moment = require("moment");
// const DataStore = require("nedb");
// const db = new DataStore({
//   filename: "./db/test.ndjson",
//   autoload: true,
//   timestampData: true,
//   corruptAlertThreshold: 1
// });

const Datastore = require("nedb-promises");
let db = Datastore.create({
  filename: "./db/test.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});

const dateFormat = "YYYY-MM-DDTHH:mm:ss";
router.get("/logs", async (req, res, next) => {
  // datum komt binnen als string in het formaat DD-MM-YYYYTHH:mm
  // ====================================================================================================
  console.log(req.query.start);
  if (req.query.start || req.query.end) {
    const isvalidStartDate = moment(req.query.start, dateFormat).isValid();
    const isvalidendDate = moment(req.query.end, dateFormat).isValid();
    if (!isvalidStartDate) {
      const msg = {
        message: " start date is not valid ",
        start: req.query.start,
        status: 400
      };
      return res.status(400).json(msg);
    }
    if (!isvalidendDate) {
      const msg = {
        message:
          req.query.end === undefined
            ? "end date has not been included"
            : " end date is not valid ",
        start: req.query.end,
        status: 400
      };
      return res.status(400).json(msg);
    }
  }

  // zoek enkel de logs in de laatste 24h indien start, end niet mee worden gegeven:
  const start = moment().subtract(24, "hours"),
    end = moment();
  if (req.query.application) {
    try {
      let logs = await dataStore.readApplicationLogs(
        start,
        end,
        req.query.application,
        parseInt(req.query.skip),
        parseInt(req.query.limit)
      );
      return res.status(200).json({ total: logs.length, logs });
    } catch (e) {
      throw err;
    }
  }
  const logs = await dataStore.readLogs(start, end);
  return res.status(200).json({ total: logs.length, logs: logs });
});

const date = moment("2020-03-31T13:30:00", dateFormat);
console.log(date.toISOString());
console.log(date.isValid());

module.exports = router;
