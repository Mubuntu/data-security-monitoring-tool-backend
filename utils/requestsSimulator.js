"use strict";
const _ = require("lodash");
const axios = require("axios");
// Persistent datastore with automatic loading

const db = require("../db/dbPromises");

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
// axios.interceptors.request.eject(interceptor); // indien je de interceptor wilt verwijderen

// concurrent requests processing https://stackoverflow.com/questions/53064328/axios-how-to-run-http-requests-concurrently-and-get-the-result-of-all-requests/53064769#53064769
const getAllRequests = async endpoints => {
  const requests = endpoints.map(log => {
    return axios({
      url: log.endpoint.toLowerCase(),
      method: log.method
    }); //.catch(()=> null); // overbodig want gefaalde responses worden als succesvol geresolved
  });
  return await axios.all(requests);
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
    // console.log(endpoints);
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
      // console.log(ids);
    }
    // console.log(endpoints);

    // stel de http requests op
    // ----------------------------------------------------------------------------------------
    const responses = getAllRequests(endpoints);
    responses
      .then(values => {
        // console.log(values);
        // schrijf response object weg naar logs
        // endpoints.foreach( log.url === values.config.url)... bekijk prikbord voor img
        let simulatedResponses = [];
        values.forEach(res => {
          let secured = false; 
          let statusCode = parseInt(res.status)
          if(statusCode>=400){
              secured = true
          }
      
          let response = {
            status: res.status,
            statusText: res.statusText,
            url: res.config.url,
            method: res.config.method,
            headers: res.headers, 
            secured: secured
            // data: res.data
          };
          simulatedResponses.push(response);
        });
        // itereer over de simulatie objecten en voeg
        let changedLogs = [];

        for (let endpoint of endpoints) {
          // haal de logs op die de zelfde HTTP request uitvoeren
          let logsToBeChanged = rLogs.filter(log =>
            endpoint.ids.includes(log._id)
          );
          // vind de gesimuleerde request die deze logs matcht
          // console.log(endpoint);
          let simulatedResponse = simulatedResponses.find(
            res =>
              res.url.toLowerCase() === endpoint.endpoint.toLowerCase() &&
              res.method.toLowerCase() === endpoint.method.toLowerCase()
          );
          // console.log(simulatedResponse);
          // voeg de gesimuleerde request toe aan logs
          let logsWithSimulatedResponses = logsToBeChanged.map(log => {
            
            return {
              ...log,
              simulated: true,
              simulatedResponse: simulatedResponse,
            };
          });
          // merge de twee arrays (push zou gewoon een multidimensionale array vormen)
          changedLogs.push.apply(changedLogs, logsWithSimulatedResponses);
          // console.log(changedLogs)
        }
        // console.log("originele logs: \n", rLogs);
        // console.log("updated logs: \n", changedLogs);

        db.bulkUpdateLogs(changedLogs);
        
        // --------------------------------------------------------------------------------------

        resolve(changedLogs);
      })
      .catch(err => reject(err)); // reject wordt nooit benaderd

    // ----------------------------------------------------------------------------------------
  });
};
// test data

// testen van simulaties met test data:
const moment = require("moment");
const from = moment().subtract("7", "days");
const to = moment();
const callback = logs => {
  console.log(logs);
  simulate(logs);
};
// db.readLogs(from, to).then(logs => callback(logs));
// simulate(logs);
module.exports = simulate;
