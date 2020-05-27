"use strict";
const express = require("express");
const router = express.Router();
const dataStore = require("../db/dbPromises");

router.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "welcome to the whitelist API", typePost: req.method });
});

router.post("/", async (req, res, next) => {
  // check if body contains whitelist array:
  if (req.body.whitelist) {
    var whitelist = req.body.whitelist;
  } else {
    const appName = req.body.appName;
    const path = req.body.path;
    const userId = req.body.userId;
    var whitelist = { appName: appName, path: path, userId: userId };
    if (appName === undefined || path === undefined || userId === undefined) {
      return res.status(400).json({
        message: `problem occured with payload check properties.`,
        // whitelist: insertedWhitelist,
      });
    }
  }

  try {
    const insertedWhitelist = await dataStore.insertWhitelist(whitelist);
    if (Number.isInteger(insertedWhitelist.length)) {
      return res.status(201).json({
        message: `${insertedWhitelist.length} whitelist objects have been created.`,
        whitelist: insertedWhitelist,
      });
    } else if (!Number.isInteger(insertedWhitelist.length)) {
      return res.status(201).json({
        message: `whitelist with id ${insertedWhitelist._id} has been created.`,
        length: insertedWhitelist.length,
        // whitelist: insertedWhitelist,
      });
    } else {
      return res
        .status(400)
        .json({ message: `whitelist object exists already.` });
    }
    // zou een object moeten geven met een message.
  } catch (e) {
    console.log(e);
    if (
      e.errorType === "uniqueViolated" ||
      e.message === "whitelist object exists already." ||
      "whitelist objects  already exist in DB"
    ) {
      return res.status(400).json({ code: 400, message: e.message });
    }
    throw e;
  }
});

router.get("/:userId", async (req, res, next) => {
  const userId = req.params["userId"];
  try {
    const whitelisting = await dataStore.bulkReadWhitelistByUserId(userId);
    // if(whitelisting.length>0){
    return res.status(200).json({ whitelist: whitelisting });
    // }
  } catch (e) {
    console.log(e);
    if (e.message === "whitelist object exists already.") {
      return res.status(409).json({ message: e.message });
    }
    throw e;
  }
});

/**
 * delete a whitelist object
 */
router.delete("/:userId/:_id", async (req, res, next) => {
  const whiteListId = req.params._id;
  const userId = req.params.userId;
  try {
    const recordsDeletedDeleted = await dataStore.deleteWhitelist({
      _id: whiteListId,
      userId: userId,
    });
    if (recordsDeletedDeleted > 0) {
      return res.status(201).json({
        message: ` ${recordsDeletedDeleted} object has been removed.`,
      });
    } else {
      return res
        .status(403)
        .json({ message: "whitelist object was not found." });
    }
    // zou een object moeten geven met een message.
  } catch (e) {
    console.log(e);
    throw e;
  }
});

module.exports = router;
