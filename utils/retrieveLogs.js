const rp = require("request-promise");
const fs = require("fs").promises;
const moment = require("moment");
const retrieveCookie = require("./scrapeAuthCookie");
const logParser = require("./logParser");

const retrieveLogs = async (from, to) => {
  return new Promise(async (resolve, reject) => {
    // ==========request payload =================================-
    const rawPayload = [
      {
        index: "logstash-*",
        ignore_unavailable: true
        // preference: 1583313865923
      },
      {
        timeout: "30000ms",
        highlight: {
          fields: { "*": {} },
          fragment_size: 2147483647,
          post_tags: ["@/kibana-highlighted-field@"],
          pre_tags: ["@kibana-highlighted-field@"]
        },
        size: 500,
        sort: [{ "@timestamp": { order: "desc", unmapped_type: "string" } }],
        _source: { excludes: [] },
        stored_fields: ["*"],
        script_fields: {},
        docvalue_fields: [
          { field: "@timestamp", format: "date_time" },
          { field: "request_received_at", format: "date_time" },
          { field: "request_sent_at", format: "date_time" },
          { field: "response_received_at", format: "date_time" },
          { field: "response_sent_at", format: "date_time" },
          { field: "written_at", format: "date_time" },
          { field: "custom_fields.request_end_at", format: "date_time" },
          { field: "custom_fields.startTime", format: "date_time" },
          { field: "custom_fields.@timestamp", format: "date_time" },
          { field: "custom_fields.err_timestamp", format: "date_time" },
          { field: "custom_fields.response_end_at", format: "date_time" },
          { field: "custom_fields.expiredAt", format: "date_time" },
          { field: "custom_fields.agrirouter_iotcf_end", format: "date_time" }
        ],
        query: {
          bool: {
            must: [{ match_all: {} }, { match_all: {} }],
            filter: [
              { match_phrase: { type: { query: "request" } } },
              {
                range: {
                  "@timestamp": {
                    format: "strict_date_optional_time",
                    gte: from,
                    lte: to
                  }
                }
              }
            ],
            should: [],
            must_not: []
          }
        }
      }
    ];
    try {
      // =====================================================================================================================
      const authCookie = await retrieveCookie();

      // console.log(authCookie)
      // maak zelf een cookie aan: https://stackoverflow.com/questions/42065364/how-do-you-handle-cookies-with-request-promise

      const options = {
        method: "POST",
        simple: false,
        qs: {
          rest_total_hits_as_int: true,
          ignore_throttled: true
        },
        followRedirects: true,
        followRedirect: true,
        headers: {
          "Content-Type": "application/x-ndjson",
          Accept: "application/json, text/plain",
          "kbn-xsrf": "true",
          Cookie: `goauth-goauth-1=${authCookie.value}`
        },
        uri: "https://logs.cf.eu10.hana.ondemand.com/elasticsearch/_msearch",
        // uri:"https://logs.cf.eu10.hana.ondemand.com/",
        // jar: cookieJar, // tell rp to include cookies in jar that match uri
        resolveWithFullResponse: true,
        // convert javascript object to NDJSON payload
        body: rawPayload.map(JSON.stringify).join("\n") + "\n"
      };
      await rp(options)
        .then(response => {
          console.log("gegevens ontvangen");

          //======================== PARSE individual logs and retrieve necessary components ==========================================
          const bodyString = response.body;

          const logs = logParser(bodyString);
         

          resolve(logs);
          //===========================================================================================================================
          // tijdelijk wegschrijven voor testing purposes
          fs.writeFile("./tmp/responseKibana.json", JSON.stringify(response))
            .then(() => {
              console.log("file saved");
            })
            .catch(error =>
              console.error("error bij het wegschrijven van logs", error)
            );
          console.dir(bodyString.responses, { depth: null, colors: true });
          fs.writeFile("./tmp/requestLogs.json", response.body)
            .then(() => {
              console.log("file saved");
            })
            .catch(error =>
              console.error("error bij het wegschrijven van logs", error)
            );
        })
        .catch(e => {
          if (e.StatusCodeError) {
            console.log("er ging weer iets fenomenaal mis");
          }
          console.log(e);
          // reason.response is the transformed response
        });

      // console.log("data from request: \n\n",response)

      // echte catch
    } catch (e) {
      console.log(e);
      reject(e);
      throw e;
    }
  });
};

// const from = moment()
//   .subtract("7", "days")
//   .toISOString();
// const to = moment().toISOString();

// const data = retrieveLogs(from, to);
// setTimeout(() => console.log(data), 10000);

module.exports = retrieveLogs;
