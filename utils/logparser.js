"use strict";
const fs = require("fs");
const logModel = require("../db/model/logModel");

const parse = async bodyString => {
  const body = JSON.parse(bodyString);
  /**
   * we gaan een data structure implementeren:
   * key zal de application name zijn en value zal de log object zijn
   */

  // let appLogs = hits.filter(rawLog => {
  //   // onder de parameter x_forwarded_for zouden we de logs moeten uitfilteren die gegereneerd werden vanuit het publieke ip adres van de data monitoring tool zelf
  //   // zodra een http request wordt verzonden vanuit de security-backend zou deze niet moeten worden opgenomen in de database
  //   // dit kan je doen door een vergelijking tussen de parameter x_forwarded_for (nadat je de lijst splitst) en   https://github.com/sindresorhus/public-ip
  //  return rawLog._source.layer === "[CF.RTR]" ;
  // });
  let filteredLogs = hits.filter(
    rawLog =>
      rawLog._source.layer === "[CF.RTR]" &&
      rawLog._source.user_agent !== "axios/0.19.2"
  );
  let logs = filteredLogs.map(rawLog => {
    // enkel logs gegeneerd door de Cloud Foundry Router opnemen
    const log = logModel(rawLog);
    return log;
  });
  // console.log(logs);

  return logs;
};

module.exports = parse;
