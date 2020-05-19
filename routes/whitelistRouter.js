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
  const appName = req.body.appName;
  const path = req.body.path;
  const userId = req.body.userId;

  try {
    const insertedWhitelist = await dataStore.insertWhitelist({
      appName: appName,
      path: path,
      userId: userId,
    });
    if (insertedWhitelist) {
      return res.status(201).json({
        message: `whitelist with id ${insertedWhitelist._id} has been created.`,
        whitelist: insertedWhitelist,
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
      e.message === "whitelist object exists already."
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
        message: `whitelist with id ${whitelistObj._id} has been removed.`,
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
