"use strict";
const _ = require("lodash");
const axios = require("axios");

// interceptor die alle responses waarvan de status niet 2xx is toch resolved
const interceptor = axios.interceptors.response.use(
  res => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return res;
  },
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
      //
      return Promise.resolve(error.response);
    }
    if (error.request) {
      // Something happened in setting up the request that triggered an Error
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("Error", error.message);
    }
  }
);

const getAllRequests = async endpoints => {
  const requests = endpoints.map(log => {
    return axios({
      url: log.endpoint.toLowerCase(),
      method: log.method
    }); //.catch(()=> null);
  });
  return axios.all(requests);
};

const simulate = async logs => {
  new Promise((resolve, reject) => {
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
    // per endpoint moet je een array aanmaken aan id's (van een log) die dezelfde url bevatten
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
    console.log(endpoints);

    // stel de http requests op
    // ----------------------------------------------------------------------------------------

    const responses = getAllRequests(endpoints);
    responses
      .then(values => {
        console.log(values);
        // schrijf response object weg naar 
      })
      .catch(err => reject(err)); // reject wordt nooit benaderd
    resolve(values);

    // ----------------------------------------------------------------------------------------
  });
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
    _id: "n4TbBnEBUUL1vWPuC4TV",
    application_name: "express-demo-app",
    domain: [
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com"
    ],
    path: "/login",
    endpoint:
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/login",
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
    path: "/users/98b94eda-3588-4604-afd3-1587fd566dcf",
    endpoint:
      "https://express-demo-app-thankful-serval-vn.cfapps.eu10.hana.ondemand.com/users/98b94eda-3588-4604-afd3-1587fd566dcf",
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
  }
];

simulate(logs);
