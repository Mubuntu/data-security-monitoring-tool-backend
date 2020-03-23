const moment = require('moment')
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
const logModel = (rawLog) => {
//   id,
//   application_name,
//   domain,
//   path,
//   method,
//   protocol,
//   response_status,
//   response_content_type,
//   organization_name,
//   space_name,
//   logging_service_name,
//   user_agent,
//   received_at,
//   response_sent_at,
//   level,
//   type
// ) 
  // date objecten moeten hier vanuit de string worden geconverteerd naar ee date object 
  return {
    
    _id: rawLog._id,
    application_name: rawLog._source.component_name,
    domain: extractDomain(rawLog._source.referer),
    path: rawLog._source.request,
    endpoint: rawLog._source.referer,
    // extra_headers: rawLog._source.extra_headers,
    // remote_port: rawLog._source.remote_port,
    method: rawLog._source.method,
    // remote_ip: rawLog._source.remote_ip,
    protocol: rawLog._source.protocol,
    response_status: rawLog._source.response_status,
    response_content_type: rawLog._source.response_content_type,
    organization_name: rawLog._source.organization_name,
    space_name: rawLog._source.space_name,
    logging_service_name: rawLog._source.service_instance_name,
    service_name: rawLog._source.service_name,
    dest_ip_and_port: rawLog._source.dest_ip_and_port,
    user_agent: rawLog._source.user_agent,
    request_received_at: moment(rawLog._source.request_received_at, "YYYY-MM-DDTHH:mm:ss.SSS").toDate(),
    // response_sent_at: moment(rawLog._source.response_sent_at, "YYYY-MM-DDTHH:mm:ss.SSS"),
    remote_user: rawLog._source.remote_user,
    level: rawLog._source.level,
    // layer: rawLog._source.layer,
    // referer: rawLog._source.referer,
    type: rawLog._source.dest_ip_and_port,
    simulated: false,
  

    // _id: id,
    // application: application_name,
    // url: domain,
    // path: path,
    // method: method,
    // protocol: protocol,
    // response_status: response_status,
    // response_content_type: response_content_type,
    // organization_name: organization_name,
    // space_name: space_name,
    // logging_service_name: logging_service_name,
    // user_agent: user_agent,
    // received_at: received_at,
    // response_sent_at: response_sent_at,
    // level: level,
    // type: type
  };
};

const extractDomain = str => {
  const domain = str.match(
    /^(?:https?:)?(?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/gim
  );
  return domain;
};

module.exports = logModel