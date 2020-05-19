"use strict";
const express = require("express");
const router = express.Router();
const dataStore = require("../db/dbPromises");
const moment = require("moment");

const dateFormat = "YYYY-MM-DDTHH:mm:ss";
router.get("/", async (req, res, next) => {
  let start = req.query.start || null,
    end = req.query.end || null,
    skip = parseInt(req.query.skip) || null,
    limit = parseInt(req.query.limit) || null,
    application = req.query.application || null,
    response = null;
  switch (req.query.response) {
    case "true":
      response = true;
      break;
    case "false":
      response = false;
      break;
    default:
      response = null;
  }

  // await dataStore.db
  //   .count()
  //   .then((c) => console.log("totaal aantal logs: ", c));

  // datum komt binnen als string in het formaat DD-MM-YYYYTHH:mm
  // ====================================================================================================
  // console.log(req.query.start);
  if (start || end) {
    const isvalidStartDate = moment(req.query.start, dateFormat).isValid();
    const isvalidendDate = moment(req.query.end, dateFormat).isValid();
    if (!isvalidStartDate) {
      const msg = {
        message: " start date is not valid ",
        start: start,
        status: 400,
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
        status: 400,
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
            limit,
            response
          );
          const requestVerdeling = totalSecuredAndInsecuredRequests(logs);
          return res.status(200).json({
            total: logs.length,
            logs: logs,
            insecuredTotal: requestVerdeling.totalInsecuredRequests,
            securedTotal: requestVerdeling.totalSecuredRequests,
          });
        } catch (e) {
          throw err;
        }
      }
    }
    // vraag logs op binnen een periode
    try {
      const logs = await dataStore.readLogs(start, end, skip, limit, response);
      const requestVerdeling = totalSecuredAndInsecuredRequests(logs);
      return res.status(200).json({
        total: logs.length,
        logs: logs,
        insecuredTotal: requestVerdeling.totalInsecuredRequests,
        securedTotal: requestVerdeling.totalSecuredRequests,
      });
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  // zoek enkel de logs in de laatste 24h indien start, end niet mee worden gegeven:
  (start = moment().subtract(1, "days")), (end = moment());
  console.log(`looking for logs between date range of: `);
  if (application) {
    try {
      let logs = await dataStore.readApplicationLogs(
        start,
        end,
        application,
        skip,
        limit,
        response
      );
      const requestVerdeling = totalSecuredAndInsecuredRequests(logs);
      return res.status(200).json({
        total: logs.length,
        logs: logs,
        insecuredTotal: requestVerdeling.totalInsecuredRequests,
        securedTotal: requestVerdeling.totalSecuredRequests,
      });
    } catch (e) {
      throw err;
    }
  }
  const logs = await dataStore.readLogs(start, end, limit, skip, response);
  const requestVerdeling = totalSecuredAndInsecuredRequests(logs);
  return res.status(200).json({
    total: logs.length,
    logs: logs,
    insecuredTotal: requestVerdeling.totalInsecuredRequests,
    securedTotal: requestVerdeling.totalSecuredRequests,
  });
});

router.get("/:count", async (req, res, next) => {
  let start = req.query.start || null,
    end = req.query.end || null;

  if (start || end) {
    const isvalidStartDate = moment(req.query.start, dateFormat).isValid();
    const isvalidendDate = moment(req.query.end, dateFormat).isValid();
    if (!isvalidStartDate) {
      const msg = {
        message: " start date is not valid ",
        start: start,
        status: 400,
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
        status: 400,
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

const totalSecuredAndInsecuredRequests = (logs) => {
  let insecuredCounter = 0;
  let securedCounter = 0;
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].simulatedResponse.secured) {
      securedCounter++;
    } else {
      insecuredCounter++;
    }
  }

  return {
    totalInsecuredRequests: insecuredCounter,
    totalSecuredRequests: securedCounter,
  };
};
// const date = moment("2020-03-31T13:30:00", dateFormat);
// console.log(date.toISOString());
// console.log(date.isValid());
module.exports = router;
