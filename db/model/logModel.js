const moment = require("moment");
/**
 * this function creates a logModel Object.
 * @param {String} id
 * @param {String} application_name name of the application
 * @param {String} domain
 * @param {String} path path to resource
 * @param {String} method HTTP Method
 * @param {String} protocol
 * @param {Number} response_status status code of the response
 * @param {String} response_content_type
 * @param {String} organization_name organisation name in Cloud Foundry
 * @param {String} space_name space name in Cloud Foundry
 * @param {String} logging_service_name name of the logging service bound to the application
 * @param {String} user_agent user agent used to make the the API call
 * @param {Date} received_at date and time on which the request was received as an ISO String
 * @param {Date} response_sent_at
 * @param {String} level logging layer from which the log is emitted
 * @param {String} type log type (can be either log, trace or request)
 */
// https://github.com/louischatriot/nedb#inserting-documents
const logModel = rawLog => {
  if (rawLog._source.layer === "[CF.RTR]") {
    // console.log("host ",  rawLog._source.request_host,"path ", rawLog._source.request)
    return {
      _id: rawLog._id,
      application_name: rawLog._source.component_name,
      domain: rawLog._source.request_host,
      path: rawLog._source.request,
      endpoint: checkURI(rawLog._source.request_host + rawLog._source.request),
      method: rawLog._source.method,
      response_status: rawLog._source.response_status,
      organization_name: rawLog._source.organization_name,
      space_name: rawLog._source.space_name,
      logging_service_name: rawLog._source.service_instance_name,
      service_name: rawLog._source.service_name,
      dest_ip_and_port: rawLog._source.dest_ip_and_port,
      user_agent: rawLog._source.user_agent,
      request_received_at: convertToLocalTime(
        rawLog._source.request_received_at
      ),
      // level: rawLog._source.level,
      // type: rawLog._source.type,
      simulated: false
    };
  }
  return;
};
const extractIpAdress = str => {
  return str.split(",")[0];
};
const extractDomain = str => {
  const domain = str.match(
    /^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/gim
  );
  return domain;
};

const checkURI = str => {
  const pattern = /^((http|https|ftp):\/\/)/;
  if (!pattern.test(str)) return (url = "https://" + str);
  return str;
};
const convertToLocalTime = str => {
  let utcDate = moment.utc(str, "YYYY-MM-DDTHH:mm:ss");
  let lokaleTijd = moment(utcDate, "YYYY-MM-DDTHH:mm:ss").local();
  // console.log(lokaleTijd.toDate())
  return lokaleTijd.toDate();
};
let date = "2020-3-31T07:17:18";
//utc
// let utcDate = moment.utc(date, "YYYY-MM-DDTHH:mm:ss");
// console.log("utc", utcDate.toISOString());
//converting to local date
// var local = moment(utcDate, "YYYY-MM-DDTHH:mm:ss").local(); //.format('YYYY-MM-DDTHH:mm:ss');
// console.log("lokale tijd", local.toDate());
module.exports = logModel;
