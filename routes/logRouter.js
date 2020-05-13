"use strict";
const express = require("express");
const router = express.Router();
const dataStore = require("../db/dbPromises");
const moment = require("moment");
router.get('/', (req, res)=>{
  res.status(200).json({message: "welcome to log API"})
})
const dateFormat = "YYYY-MM-DDTHH:mm:ss";
router.get("/logs", async (req, res, next) => {
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
        securedTotal: requestVerdeling.totalSecuredRequests
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
        securedTotal: requestVerdeling.totalSecuredRequests
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
    securedTotal: requestVerdeling.totalSecuredRequests
  });
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
/**
 * 
 */
router.get("/whitelist/:userId", async (req, res, next) => {
  const userId = req.params["userId"];
  try{
    const whitelisting = await dataStore.bulkReadWhitelistByUserId(userId);
    // if(whitelisting.length>0){
      return res.status(200).json({whitelist: whitelisting});
    // }
  }catch(e){
    console.log(e);
    if(e.message === "whitelist object exists already."){
      return res.status(409).json({message: e.message})
    }
    throw e;
  }

}); 

/**
 * post a new whitelist object
 */
router.post("/whitelist/:userId", async (req, res, next) => {
  const appName = req.body.appName;
  const path = req.body.path;
  const userId = req.params["userId"];

  try{
   const insertedWhitelist =  await dataStore.insertWhitelist({appName: appName, path: path, userId: userId});
    if(insertedWhitelist){
      return res.status(201).json({message: `whitelist with id ${insertedWhitelist._id} has been created.`});
    }else{
    return   res.status(400).json({message: `whitelist object exists already.`});
    }
    // zou een object moeten geven met een message.
  }catch(e){
    console.log(e);
    if(e.errorType === "uniqueViolated"|| e.message === "whitelist object exists already."){
      return res.status(400).json({code: 400, message: e.message})
    }
    throw e;
  }
});
/**
 * delete a whitelist object
 */
router.delete("/whitelist/:userId/:_id", async (req, res, next) => {
  const whiteListId = req.params._id;
  const userId = req.params.userId;
  try{
   const recordsDeletedDeleted =  await dataStore.deleteWhitelist({_id: whiteListId, userId: userId});
    if(recordsDeletedDeleted>0){
      return res.status(201).json({message: `whitelist with id ${whitelistObj._id} has been removed.`});
    }else{
        return res.status(403).json({message: "whitelist object was not found."})
    }
    // zou een object moeten geven met een message.
  }catch(e){
    console.log(e);
    throw e;
  }
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
