var express = require("express");
var router = express.Router();
// const { retrieveCookie, retrieveLogs } = require("../utils/webscrape");
const moment = require("moment");
const retrieveLogs = require("../utils/retrieveLogs");
/**
 *  GET home page
 *
 * . */
router.get("/", async function(req, res, next) {
  const startDateString =
    req.params["from"] ||
    moment()
      .subtract("7", "days")
      .toISOString();
  const endDateString = req.params["to"] || moment().toISOString();
  const application = req.params["app"];
  // ==================================== VALIDATIE parameters ================================================
  if (startDateString) {
    try {
      const from = moment(startDateString);
      const to = moment(endDateString);
      if (!from.isValid()) {
        res.status(400).send({ error: "start date is not valid." });
      }
      if (!to.isValid())
        res.status(400).send({ error: "end date is not valid." });
      if (from > to) {
        res
          .status(400)
          .send({ error: "start date must be earlier than end date." });
      }

      const logs = await retrieveLogs(from, to);

      
      if(application){
        const filteredLogs = logs.filter(l[application])
        filteredLogs>0? filteredLogs: res.status(404).send({ error: `logs for application ${application} not found.` })
      }

      res.status(200).send({logs})
    } catch (e) {}
  }

  // ====================================================================================================

  requestLogs = retrieveLogs(from, to);
});

module.exports = router;
