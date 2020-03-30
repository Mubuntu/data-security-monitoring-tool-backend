"use strict";
const fs = require("fs");
const logPath = "./tmp/requestLogs.json";
const moment = require("moment");
const ip = require("public-ip");
const logModel = require("../data/model/logModel");

const parse = async bodyString => {
  const body = JSON.parse(bodyString);
  // raw logs
  const hits = body.responses[0].hits.hits;
  let ip4 = await ip.v4();

  // const logs = [];
  // console.log(hits[0]);
  const length = hits.length;

  const names = hits.map(h => h._source.component_name);
  const apps = [...new Set(names)];
  // console.log(apps)
  const l = new Set();

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
  let filteredLogs = hits.filter((rawLog)=>rawLog._source.layer === "[CF.RTR]")
  let logs = filteredLogs.map(rawLog => {
    // enkel logs gegeneerd door de applicatie zelf opnemen
    const log = logModel(rawLog);
    // skip the http requests die vanuit de client met het ip adres van de monitoring tool werden gemaakt (enkel wanneer de applicatie live gaat)
    // return log.referer_ip_adress === ip4 ? null : log;
    return log;
  });
  // console.log(logs);

  return logs;
};

module.exports = parse;
