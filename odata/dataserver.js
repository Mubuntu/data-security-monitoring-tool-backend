const DataStore = require("nedb");
const db = new DataStore({
  filename: "./db/test.ndjson",
  autoload: true,
  timestampData: true,
  corruptAlertThreshold: 1
});

var http = require("http");

const ODataServer = require("simple-odata-server");
const Adapter = require("simple-odata-server-nedb");
const model = {
  namespace: "amista",
  entityTypes: {
    LogType: {
      _id: { type: "Edm.String", key: true },
      application_name: { type: "Edm.String" },
      domain: { type: "Edm.String" },
      path: { type: "Edm.String" },
      method: { type: "Edm.String" },
      response_status: { type: "Edm.String" },
      organization_name: { type: "Edm.String" },
      space_name: { type: "Edm.String" },
      logging_service_name: { type: "Edm.String" },
      service_name: { type: "Edm.String" },
      dest_ip_and_port: { type: "Edm.String" },
      user_agent: { type: "Edm.String" },
      request_received_at: { type: "Edm.DateTimeOffset" },
      simulated: { type: "Edm.Boolean" },
      // simulatedResponse: { type: "amista.simulatedResponse" },
      // createdAt: { type: "Edm.DateTimeOffset" },
      // updatedAt: { type: "Edm.DateTimeOffset" }
    }
  },
  // complexTypes: {
  //   simulatedResponse: {
  //     status: { type: "Edm.Int16" },
  //     statusText: { type: "Edm.String" },
  //     url: { type: "Edm.String" },
  //     method: { type: "Edm.String" },
  //     headers: {
  //       "content-length": { type: "Edm.String" },
  //       "content-type": { type: "Edm.String" },
  //       date: { type: "Edm.String" }
  //     }
  //   }
  // },
  entitySets: {
    logs: {
      entityType: "amista.LogType"
    }
  }
};

const odataServer = ODataServer("http://localhost:1337")
  .model(model)
  .adapter(
    Adapter((es, cb) => {
      cb(null, db);
    })
  );

http.createServer(odataServer.handle.bind(odataServer)).listen(1337);
module.exports = odataServer;
