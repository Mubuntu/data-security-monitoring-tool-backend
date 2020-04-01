const CronJob = require("cron").CronJob;
const logRetrieval = require("../utils/logRetrieval");
const db = require("../db/database");
const moment = require("moment");
const minutes = 15;
const logRetievalJob = new CronJob(
  // "35 15 * * *",
  `*/${minutes} * * * *`,
  async () => {
    console.log("commencing job: log retrieval from Kibana");
    const from = moment().subtract(35, "minutes");
    const to = moment();
    console.log(
      "retrieving logs between ",
      from.toISOString(),
      " and ",
      to.toISOString()
    );
    await logRetrieval(from, to);
    console.log("ending job: log retrieval from Kibana");
  },
  () => {
    start = moment();
    end = moment().add(15, "minutes");
  },
  true,
  "Europe/Brussels"
);
const hours = 24;
const logRemoval = new CronJob(
  // `*/1 * * * *`, // elke minuut
  `0 */${hours} * * *`, // elke 24 uur
  async () => {
    console.log("commencing job: log removal job");
    const expirationDate = moment().subtract(30, "days");
    console.log("checking for expired logs", expirationDate.toDate());
    await db.removeExpiredLogs(expirationDate);
    console.log("ending job: log removal job");
  },
  () => {
    start = moment();
    end = moment().add(15, "minutes");
  },
  true,
  "Europe/Brussels"
);
const start = () => {
  console.log(`application will search for new logs every ${minutes} minutes.`);
  logRetievalJob.start();
  console.log(`application will check for expired logs every ${hours} hours.`)
  logRemoval.start();
};

module.exports = {
  start: start
};