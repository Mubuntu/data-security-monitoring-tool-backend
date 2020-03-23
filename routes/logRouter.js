"use strict";
var express = require("express");
var router = express.Router();
// const { retrieveCookie, retrieveLogs } = require("../utils/webscrape");
const moment = require("moment");
const retrieveLogs = require("../utils/retrieveLogs");
const { readFile } = require("../utils/helperMethods");
/**
 *  GET home page
 *
 * . */
router.get("/Logs", async function(req, res, next) {
  // datum komt binnen als string in het formaat DD-MM-YYYY HH:mm

  const from =
    moment(req.query.from, "DD-MM-YYYY HH:mm") ||
    moment().subtract("24", "hours");
  const to = moment(req.query.to, "DD-MM-YYYY HH:mm") || moment();
  const application = req.query.app;
  // ==================================== VALIDATIE parameters ================================================
  try {
    // const from = moment(startDateString);
    // const to = moment(endDateString);
    if (!from.isValid()) {
      return res.status(400).send({
        error: "start date is not valid."
      });
    }
    if (!to.isValid())
      return res.status(400).send({
        error: "end date is not valid."
      });
    if (from > to) {
      return res.status(400).send({
        error: "start date must be earlier than end date."
      });
    }
    // haal gegevens op:
    readFile(data => {
      // filter op applicatie
      if (application) {
        // filter op applicatie
        let appLogs = data.find(
          app => app.name.toLowerCase() === application.toLowerCase()
        );
        if (!appLogs) {
          //  the requested resource exists, but has no state representation to include in the body || 404
          return res.status.status(404).send({
            status: 204,
            message: `no logs found for application ${application} `
          });
        }
        // filter op datum:
        //  const filteredAppLogs ={
        //    name: appLogs.name,
        //    logs: appLogs.logs.filter(logs.request_received_at>= from && logs.request_received_at<=to)
        //  }
        const filteredLogs = appLogs.logs.filter(log => {
          const received_date = moment(
            log.request_received_at,
            "YYYY-MM-DDTHH:mm:ss.SSSZ" // 2020-03-06T11:13:14.167702664Z   <--------------------------------------
          );
          console.log(`FROM: ${from.toISOString()}
          TO: ${to.toISOString()}
          RECEIVED DATE: ${received_date.toISOString()}`);
          const isWithinRange =
            received_date.isAfter(from) && received_date.isBefore(to);
          return isWithinRange;
        });
        if (!filteredLogs.length === 0) {
          return res
            .status(404)
            .send({ message: "no logs found in this range." });
        }
        return res.status(200).send(filteredLogs);
      }
      const appLogs = data;

      // filter op start en eind datum
      let filteredLogs = [];
      for (let i = 0; i < appLogs.length; i++) {
        let logs = appLogs[i].logs.map(log => {
          const received_date = moment(log.request_received_at, "DD");
          console.log(`FROM: ${from.toISOString()}
                      TO: ${to.toISOString()}
                      RECEIVED DATE: ${received_date.toISOString()}`);
          const isWithinRange =
            received_date.isAfter(from) && received_date.isBefore(to);

          return isWithinRange;
        });
        let applicationLog = { name: appLogs[i].name, logs: logs };
        filteredLogs.push(applicationLog);
      }
      if (!filteredLogs)
        return res
          .status(404)
          .send({ message: "no logs found in this range." });

      return res.status(200).send(filteredLogs);
    });
  } catch (e) {}

  // ====================================================================================================
});

module.exports = router;
