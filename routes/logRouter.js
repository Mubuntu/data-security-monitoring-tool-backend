"use strict";
const express = require("express");
const router = express.Router();
const dataStore = require("../db/dbPromises");
const moment = require("moment");

const dateFormat = "YYYY-MM-DDTHH:mm:ss";
router.get("/logs", async (req, res, next) => {
  let start = req.query.start || null,
    end = req.query.end || null,
    skip = parseInt(req.query.skip) || 0,
    limit = parseInt(req.query.limit) || 0,
    application = req.query.application || null;

  // datum komt binnen als string in het formaat DD-MM-YYYYTHH:mm
  // ====================================================================================================
  // console.log(req.query.start);
  if (start || start) {
    const isvalidStartDate = moment(req.query.start, dateFormat).isValid();
    const isvalidendDate = moment(req.query.end, dateFormat).isValid();
    if (!isvalidStartDate) {
      const msg = {
        message: " start date is not valid ",
        start: start,
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
        start: end,
        status: 400
      };
      return res.status(400).json(msg);
    }
    start = moment(req.query.start, dateFormat);
    end = moment(req.query.end, dateFormat);
    
    if (application) {
      if (application) {
        try {
          let logs = await dataStore.readApplicationLogs(
            start,
            end,
            application,
            skip,
            limit
          );
          return res.status(200).json({ total: logs.length, logs });
        } catch (e) {
          throw err;
        }
      }
    }
    // vraag logs op binnen een periode
    try {
      const logs = await dataStore.readLogs(
        start,
        end,
        parseInt(skip),
        parseInt(limit)
      );
      return res.status(200).json({ total: logs.length, logs: logs });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // zoek enkel de logs in de laatste 24h indien start, end niet mee worden gegeven:
  (start = moment().subtract(24, "hours")), (end = moment());
  if (application) {
    try {
      let logs = await dataStore.readApplicationLogs(
        start,
        end,
        application,
        skip,
        limit
      );
      return res.status(200).json({ total: logs.length, logs });
    } catch (e) {
      throw err;
    }
  }
  const logs = await dataStore.readLogs(start, end);
  return res.status(200).json({ total: logs.length, logs: logs });
});

router.get("/logs/:count", async (req, res, next) => {
  let start = req.query.start || null,
    end = req.query.end || null;

  if (start || end) {
    const isvalidStartDate = moment(req.query.start, dateFormat).isValid();
    const isvalidendDate = moment(req.query.end, dateFormat).isValid();
    if (!isvalidStartDate) {
      const msg = {
        message: " start date is not valid ",
        start: start,
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
        start: end,
        status: 400
      };
      return res.status(400).json(msg);
    }
    try {
      start = moment(start, dateFormat) || null;
      end = moment(end, dateFormat) || null;
      const count = await dataStore.countLogs(start, end);
      return res.status(200).json({ total: count });
    } catch (e) {
      res.status(500).send();
      console.log(e);
      throw e;
    }
  }
  // vraag logs op binnen een periode
  try {
    const count = await dataStore.countLogs();
    return res.status(200).json({ total: count });
  } catch (e) {
    console.log(e);
    throw e;
  }

  // zoek enkel de logcount geven van logs gegenereerd in de laatste 24h indien start en end niet mee worden gegeven:
  // (start = moment().subtract(24, "hours")), (end = moment());
  // try {
  //   let count = await dataStore.countLogs(start, end);
  //   return res.status(200).json({ total: count });
  // } catch (e) {
  //   throw err;
  // }
});
// const date = moment("2020-03-31T13:30:00", dateFormat);
// console.log(date.toISOString());
// console.log(date.isValid());

module.exports = router;
