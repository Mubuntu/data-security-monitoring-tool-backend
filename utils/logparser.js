"use strict";
const fs = require("fs");
const logPath = "./tmp/requestLogs.json";
const moment = require("moment");

const logModel = require("../data/model/logModel");

const parse = bodyString => {
  const body = JSON.parse(bodyString);
  // raw logs
  const hits = body.responses[0].hits.hits;

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

  // for (let i = 0; i < apps.length; i++) {
  //   const arr = hits.map(rawLog => {
  //     if (/*rawLog._source.component_name === apps[i] &&*/ rawLog._source.layer ==='[NODEJS]') {
  //       const log = logModel(rawLog)
  //       const logObject = {
  //         id: rawLog._id,
  //         application_name: rawLog._source.component_name,
  //         domain: extractDomain(rawLog._source.referer),
  //         path: rawLog._source.request,
  //         endpoint: rawLog._source.referer,
  //         // extra_headers: rawLog._source.extra_headers,
  //         // remote_port: rawLog._source.remote_port,
  //         method: rawLog._source.method,
  //         // remote_ip: rawLog._source.remote_ip,
  //         protocol: rawLog._source.protocol,
  //         response_status: rawLog._source.response_status,
  //         response_content_type: rawLog._source.response_content_type,
  //         organization_name: rawLog._source.organization_name,
  //         space_name: rawLog._source.space_name,
  //         logging_service_name: rawLog._source.service_instance_name,
  //         service_name: rawLog._source.service_name,
  //         dest_ip_and_port: rawLog._source.dest_ip_and_port,
  //         user_agent: rawLog._source.user_agent,
  //         request_received_at: moment(rawLog._source.request_received_at, "YYYY-MM-DDTHH:mm:ss.SSS"),
  //         response_sent_at: moment(rawLog._source.response_sent_at, "YYYY-MM-DDTHH:mm:ss.SSS"),
  //         remote_user: rawLog._source.remote_user,
  //         level: rawLog._source.level,
  //         // layer: rawLog._source.layer,
  //         // referer: rawLog._source.referer,
  //         type: rawLog._source.dest_ip_and_port
  //       };

  //       // console.log(logObject);
  //       return logObject;
  //     }

  //     return;
  //   });
  //   // create new object:
  //   const application = { name: apps[i], logs: arr };
  //   // push array to object
  //   logs.push(application);
  // }


  let appLogs = hits.filter(rawLog=>rawLog._source.layer === "[NODEJS]" && rawLog._source.referer !== '-')
  let logs = appLogs
    .map(rawLog => {
      if(rawLog._source.referer === '-'){

      }
      // enkel logs gegeneerd door de applicatie zelf opnemen
        const log = logModel(rawLog);
        return log;
    })
  console.log(logs);

  return logs;
};

module.exports = parse;
