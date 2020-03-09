const fs = require("fs");
const logPath = "./tmp/requestLogs.json";

const parse = bodyString => {
  const body = JSON.parse(bodyString);
  const hits = body.responses[0].hits.hits;

  const logs = {};
  // console.log(hits[0]);
  const length = hits.length;

  const names = hits.map(h => h._source.component_name);
  const apps = [...new Set(names)];

  for (let i = 0; i < apps.length; i++) {
    const arr = hits.map(hit => {
      if (hit._source.component_name === apps[i]) {
        const logObject = {
          application_name: hit._source.component_name,
          // host: hit._source.host,
          path: hit._source.request,
          extra_headers: hit._source.extra_headers,
          remote_port: hit._source.remote_port,

          method: hit._source.method,

          remote_ip: hit._source.remote_ip,
          protocol: hit._source.protocol,
          response_status: hit._source.response_status,
          response_content_type: hit._source.response_content_type,
          organization_name: hit._source.organization_name,
          space_name: hit._source.space_name,
          logging_service_name: hit._source.service_instance_name,
          service_name: hit._source.service_name,
          dest_ip_and_port: hit._source.dest_ip_and_port,
          user_agent: hit._source.user_agent,
          request_received_at: hit._source.request_received_at,
          response_sent_at: hit._source.response_sent_at,
          remote_user: hit._source.remote_user,
          level: hit._source.level,
          layer: hit._source.layer,
          referer: hit._source.referer,
          type: hit._source.dest_ip_and_port
        };
        // console.log(logObject);
        return logObject;
      }

      return;
    });
    // push array to object
    logs[apps[i]] = arr;
  }
  console.log(logs);

  // for (let i = 0; i < length; i++) {
  //   let log = {
  //     application_name: hits[i]._source.component_name,
  //     // host: hit._source.host,
  //     path: hits[i]._source.request,
  //     extra_headers: hits[i]._source.extra_headers,
  //     remote_port: hits[i]._source.remote_port,

  //     method: hits[i]._source.method,

  //     remote_ip: hits[i]._source.remote_ip,
  //     protocol: hits[i]._source.protocol,
  //     response_status: hits[i]._source.response_status,
  //     response_content_type: hits[i]._source.response_content_type,
  //     organization_name: hits[i]._source.organization_name,
  //     space_name: hits[i]._source.space_name,
  //     logging_service_name: hits[i]._source.service_instance_name,
  //     service_name: hits[i]._source.service_name,
  //     dest_ip_and_port: hits[i]._source.dest_ip_and_port,
  //     user_agent: hits[i]._source.user_agent,
  //     request_received_at: hits[i]._source.request_received_at,
  //     response_sent_at: hits[i]._source.response_sent_at,
  //     remote_user: hits[i]._source.remote_user,
  //     level: hits[i]._source.level,
  //     layer: hits[i]._source.layer,
  //     referer: hits[i]._source.referer,
  //     type: hits[i]._source.dest_ip_and_port
  //   };

  //   logs.push(log);
  // }
  return logs;
};
const body = fs.readFileSync("./tmp/requestLogs.json", "utf8");
parse(body);
module.exports = parse;
