"use strict";
const _ = require("lodash");

const simulate = logs => {
  // filter op logs die nog niet gecontroleerd zijn:
  let rLogs = logs.filter(log => log.simulated === false);
  // maak een uniek array gebaseerd op de urls aan:
  // https://stackoverflow.com/questions/26306415/underscore-lodash-unique-by-multiple-properties/26306963#26306963
  const endpoints = _.uniqWith(rLogs, (log1, log2) => {
    return (
      log1.endpoint === log2.endpoint &&
      log1.method === log2.method &&
      log1.application_name === log2.application_name
    );
  }).map(l => {
      // comparator 
    return {
      endpoint: l.endpoint,
      method: l.method,
      headers: l.response_content_type,
      ids: []
    };
  });
  console.log(endpoints);
  for (let i = 0; i < endpoints.length; i++) {
    // stel een lijst van id logs op die hetzelfde opgegeven path en methode bevatten en voeg deze toe aan de vooropgestelde lijst:
    let ids = rLogs
      .filter(
        l =>
          l.endpoint === endpoints[i].endpoint &&
          l.method === endpoints[i].method
      )
      .map(l => l._id);
    endpoints[i].ids = ids;
    console.log(ids);
  }
};

const logs = [
  {
    _id: "fRPDB3EBUUL1vWPuQ5lO",
    application_name: "express-demo-app",
    domain: [
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/users",
    endpoint:
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/users",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "application/json; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584969558996 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },
  {
    _id: "fRPDB3EBUUL1vWPuQ5lO",
    application_name: "express-demo-app",
    domain: [
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/users",
    endpoint:
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/users",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "application/json; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584969558996 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },

  {
    _id: "KhPCB3EBUUL1vWPuaQhw",
    application_name: "express-demo-app",
    domain: [
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/cats/facts",
    endpoint:
      "http://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/cats/facts",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "application/json; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584969509888 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },
  {
    _id: "fITbBnEBUUL1vWPuU-aC",
    application_name: "express-demo-app",
    domain: [
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/login",
    endpoint:
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/login",
    method: "POST",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "application/json; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584954365727 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },
  {
    _id: "n4TbBnEBUUL1vWPuC6CV",
    application_name: "express-demo-app",
    domain: [
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/login",
    endpoint:
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "text/html; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584954338737 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },
  {
    _id: "n4TbBnEBUUL1vWPuC6CV",
    application_name: "express-demo-app",
    domain: [
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/login",
    endpoint:
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "text/html; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584954338737 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  },
  {
    _id: "H4TaBnEBUUL1vWPu3G9Z",
    application_name: "express-demo-app",
    domain: ["https://cockpit.hanatrial.ondemand.com"],
    path: "/",
    endpoint: "https://cockpit.hanatrial.ondemand.com/cockpit/",
    method: "GET",
    protocol: "HTTP/1.1",
    response_status: 200,
    response_content_type: "text/html; charset=utf-8",
    organization_name: "s0021506423trial",
    space_name: "dev",
    logging_service_name: "express-app-logs",
    service_name: "application-logs",
    dest_ip_and_port: "-",
    user_agent: "-",
    request_received_at: { $$date: 1584954336296 },
    remote_user: "-",
    level: "INFO",
    type: "-",
    simulated: false
  }
];

simulate(logs);
