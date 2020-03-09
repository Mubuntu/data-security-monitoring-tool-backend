"use strict";
const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const cookiePath = "./tmp/cookies.json";
const moment = require("moment");
const clipboardy = require("clipboardy");
const rp = require("request-promise");
const tough = require("tough-cookie");
const Cookie = tough.Cookie;
const username="patrick.frison@amista.be"
const password="N6Dq5*E$tvkz"
/**
 * deze functie haalt een authorisatie cookie op, slaat deze lokaal op voor verder gebruik.
 */

 console.log('username in scrape:',username);
 
const retrieveCookie = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        headless: true
        // args: ["--start-fullscreen"]
      });
      const page = await browser.newPage();
      // var args = process.argv[2]
      await page.goto("https://logs.cf.eu10.hana.ondemand.com/");
      await page.click("input#j_username");
      //   page.waitForNavigation({ waitUntil: "networkidle2" }),
      await page.type("input#j_username", username);
      await page.click("input#j_password");
      await page.type("input#j_password", password);

      await page.keyboard.press("Enter");
      await page.waitForNavigation("networkidle2");
      const cookies = await page.cookies();

      cookies.forEach(c => (c.url = "https://logs.cf.eu10.hana.ondemand.com/"));
      //   console.log(cookies)
      await fs.writeFile(cookiePath, JSON.stringify(cookies, null, 2));

      const authCookie = cookies.find(c => c.name.includes("goauth-goauth-1"));
      await page.close();
      await browser.close();
      return resolve(authCookie);
    } catch (e) {
      console.log('function retrieveCOokie', e)
      return reject(e);
    }
  });
};

/**
 * deze functie gaat adhv twee date objecten een selectie logs ophalen.
 *
 */
let fromDefault = moment()
  .subtract(7, "days")
  .toDate();
// const fromString = from.format('YYYY-MM-DD HH:mm:ss.SSS')
const toDefault = new Date();
const retrieveLogs = (from = fromDefault, to = toDefault) => {
  return new Promise(async (resolve, reject) => {
    try {
      // DATE STRING FORMAT

      const fromDateString = moment(from).format("YYYY-MM-DD HH:mm:ss.SSS");
      const toDateString = moment(to).format("YYYY-MM-DD HH:mm:ss.SSS");
      const browser = await puppeteer.launch({
        args: ["--start-fullscreen"],
        defaultViewport: null,
        headless: false
      });
      const page = await browser.newPage();
      // url naar Kibana dashboard met logs
      const url =
        "https://logs.cf.eu10.hana.ondemand.com/app/kibana#/dashboard/Requests-and-Logs?_g=(refreshInterval:(pause:!t,value:0),time:(from:now-30d,to:now))&_a=(description:'',filters:!(),fullScreenMode:!f,options:(darkTheme:!f,useMargins:!t),panels:!((embeddableConfig:(),gridData:(h:4,i:'8ce89e40-ce94-4dd6-9276-6fca80a564b8',w:48,x:0,y:0),id:Navigation,panelIndex:'8ce89e40-ce94-4dd6-9276-6fca80a564b8',type:visualization,version:'7.4.2'),(embeddableConfig:(),gridData:(h:16,i:'25e1aa3e-1492-428b-8547-d36f5bff4cdc',w:12,x:0,y:4),id:Correlation-Ids,panelIndex:'25e1aa3e-1492-428b-8547-d36f5bff4cdc',type:visualization,version:'7.4.2'),(embeddableConfig:(columns:!(component_name,correlation_id,level,request,response_status,response_time_ms),sort:!('@timestamp',desc)),gridData:(h:12,i:f6a6f477-aebd-46f4-a258-c76c3235bf2a,w:36,x:12,y:4),id:Requests,panelIndex:f6a6f477-aebd-46f4-a258-c76c3235bf2a,type:search,version:'7.4.2'),(embeddableConfig:(columns:!(component_name,correlation_id,level,logger,msg),sort:!('@timestamp',desc)),gridData:(h:12,i:'8aa56b2c-de26-40fb-90bc-69c4a830538f',w:36,x:12,y:16),id:Application-Logs,panelIndex:'8aa56b2c-de26-40fb-90bc-69c4a830538f',type:search,version:'7.4.2'),(embeddableConfig:(),gridData:(h:8,i:'5c06c70c-a401-462d-b6e9-985d9100a8f3',w:12,x:0,y:20),id:Levels,panelIndex:'5c06c70c-a401-462d-b6e9-985d9100a8f3',type:visualization,version:'7.4.2'),(embeddableConfig:(),gridData:(h:8,i:'554eb236-60ef-404b-9eee-436f34cefdc8',w:16,x:0,y:28),id:Organizations,panelIndex:'554eb236-60ef-404b-9eee-436f34cefdc8',type:visualization,version:'7.4.2'),(embeddableConfig:(),gridData:(h:8,i:'7c1bc8d5-b6b6-48c2-a9ac-ba2f570c1ea9',w:16,x:16,y:28),id:Components,panelIndex:'7c1bc8d5-b6b6-48c2-a9ac-ba2f570c1ea9',type:visualization,version:'7.4.2'),(embeddableConfig:(),gridData:(h:8,i:'4aafb27d-e162-4e12-a3ee-0629ef94e201',w:16,x:32,y:28),id:Spaces,panelIndex:'4aafb27d-e162-4e12-a3ee-0629ef94e201',type:visualization,version:'7.4.2')),query:(language:lucene,query:''),timeRestore:!f,title:'Requests%20and%20Logs',viewMode:view)";
      // autorisatie cookie:
      let rawCookies = await fs.readFile(cookiePath, (error, data) => {
        if (error) throw new error();
        // console.log(data);

        return JSON.parse(data);
        // return JSON.parse(data);
      });

      // koppel cookies aan browser
      let authCookies = JSON.parse(rawCookies);
      // console.log("een cookie: \n", authCookies);
      await page.setCookie(...authCookies).catch(e => {
        if (
          e.message ===
          "Protocol error (Network.deleteCookies): Invalid parameters name: string value expected"
        ) {
          return reject(new Error("cookie has expired."));
        }
      });
      await page.goto(url);
      // begin datum aanpassen
      // await page.waitForNavigation({
      //   waitUntil: "networkidle0",
      //   timeout: 10000
      // });

      await page.waitForSelector("div.euiFormControlLayout__childrenWrapper", {
        visible: true,
        timeout: 10000
      });
      // begin datum:
      // algemene datum search veld aanklikken
      await page
        .click(
          "#kibana-body > div > div.app-wrapper > div > div.application.tab-dashboard > dashboard-app > kbn-top-nav > kbn-top-nav-helper > span > div.globalQueryBar > div.euiFlexGroup.euiFlexGroup--gutterSmall.euiFlexGroup--justifyContentFlexEnd.euiFlexGroup--directionRow.euiFlexGroup--responsive.kbnQueryBar.kbnQueryBar--withDatePicker > div.euiFlexItem.euiFlexItem--flexGrowZero > div > div.euiFlexItem.kbnQueryBar__datePickerWrapper > div > div > div > div.euiFormControlLayout__childrenWrapper > div"
        )
        .then(resolve => console.log("clicked search field"));
      // binnen searchveld start datum aanklikken
      await page.click(
        "#kibana-body > div > div.app-wrapper > div > div.application.tab-dashboard > dashboard-app > kbn-top-nav > kbn-top-nav-helper > span > div.globalQueryBar > div.euiFlexGroup.euiFlexGroup--gutterSmall.euiFlexGroup--justifyContentFlexEnd.euiFlexGroup--directionRow.euiFlexGroup--responsive.kbnQueryBar.kbnQueryBar--withDatePicker > div.euiFlexItem.euiFlexItem--flexGrowZero > div > div.euiFlexItem.kbnQueryBar__datePickerWrapper > div > div > div > div.euiFormControlLayout__childrenWrapper > div > div.euiPopover.euiPopover--anchorDownLeft.euiPopover--displayBlock > div > button"
      );
      await page
        .click("#absolute > span")
        .then(resolve => console.log("datum veldje aangeklikt"));
      // await page.click("input.euiFieldText euiFieldText--inGroup")
      // <input type="text" id="7bl1m3m4" class="euiFieldText euiFieldText--inGroup" data-test-subj="superDatePickerAbsoluteDateInput" value="2020-02-05 12:57:21.087"></input>
      // .uiFormRow euiDatePopoverContent__padded > div > div > input
      await page.click(".euiDatePopoverContent__padded > div > div > input");
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(
        ".euiDatePopoverContent__padded > div > div > input",
        fromDateString
      );
      await page.keyboard.press("Enter");
      // eind datum veld aankikken:
      await page.click(
        "#kibana-body > div > div.app-wrapper > div > div.application.tab-dashboard > dashboard-app > kbn-top-nav > kbn-top-nav-helper > span > div.globalQueryBar > div.euiFlexGroup.euiFlexGroup--gutterSmall.euiFlexGroup--justifyContentFlexEnd.euiFlexGroup--directionRow.euiFlexGroup--responsive.kbnQueryBar.kbnQueryBar--withDatePicker > div.euiFlexItem.euiFlexItem--flexGrowZero > div > div.euiFlexItem.kbnQueryBar__datePickerWrapper > div > div > div > div.euiFormControlLayout__childrenWrapper > div > div.euiPopover.euiPopover--anchorDownRight.euiPopover--displayBlock > div > button"
      );
      // popupvenster -> klikken op absolute knopje:

      // await page.click(".euiTabs.euiTabs--small.euiTabs--expand>div> div > div > button", {timeout: 1000});
      await page.click("#absolute > span");
      // klik input venster: verwijder huidige gegevens en voeg datum in
      await page.click(".euiDatePopoverContent__padded > div > div > input");
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      await page.type(
        ".euiDatePopoverContent__padded > div > div > input",
        toDateString
      );
      // await page.keyboard.press("Enter");
      // UPDATE
      await page.click("button.euiSuperUpdateButton", { timeout: 2000 });

      // await page.waitForNavigation({ timeout: 1000 }); // wacht een seconde
      //-----------------------------------------------------------------------------------------------------------
      // inspecteer netwerk logs:
      await page.click(
        "div.react-grid-item:nth-child(3) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > button:nth-child(1)",
        { timeout: 500 }
      );

      // klik op de "Inspect" knop
      await page
        .click(
          "#kibana-app > div:last-child > div > div:nth-child(3) > div > div:nth-child(2) > div > div > div:nth-child(2) > div > button:nth-child(1)"
        )
        .then(s => console.log("Inspect knop geklikt"));

      // RESPONSE KNOP WORDT NIET ALTIJD

      // // klik op "Response" knop: #kibana-app > div:nth-child(3) > div:nth-child(1) > span > div > div:nth-child(3) > div > div.euiFlyoutBody > div > div.euiTabs.euiTabs--small > button:nth-child(3)
      const responseClick = await page.waitForSelector(
        "#kibana-app > div:nth-child(3) > div:nth-child(1) > span > div > div:nth-child(3) > div > div.euiFlyoutBody > div > div.euiTabs.euiTabs--small > button:nth-child(3)",
        {
          visible: true,
          timeout: 2000
        }
      );
      console.log("wat", responseClick);
      await page.click(
        "#kibana-app > div:nth-child(3) > div:nth-child(1) > span > div > div:nth-child(3) > div > div.euiFlyoutBody > div > div.euiTabs.euiTabs--small > button:nth-child(3)",
        { delay: 500 }
      );

      // // log berichten ophalen door op de copy knop te drukken (response object wordt op het clipboard geplaatst)
      await page
        .click(
          "#kibana-app > div:nth-child(3) > div:nth-child(1) > span > div > div:nth-child(3) > div > div.euiFlyoutBody > div > div.euiCodeBlock.euiCodeBlock--fontSmall.euiCodeBlock--paddingSmall.euiCodeBlock-isCopyable > div > div > span > button"
        )
        .then(s => console.log("copied to clipboard"));

      // schrijf gegevens naar een tijdelijk bestand
      const logsPath = `./data/network_logs_${moment().format(
        "YYYY-MM-DD_HH:mm:ss"
      )}.json`;

      // vind een manier om clipboard naar een vestand te schrijven
      const clip = clipboardy.readSync();
      const logsRaw = clip;

      // console.log(logsRaw);

      fs.writeFileSync(logsPath, logsRaw, {
        encoding: "utf8",
        flag: "w"
      });
      // return logs
      return resolve(logsPath);
      await page.close();
      await browser.close();
    } catch (e) {
      return reject(e);
    }
  });
};

const retrieveLogsRequest = async (from, to) => {
  return new Promise(async (resolve, reject) => {
    // const from =  moment().subtract('7', 'days').toISOString();
    // const to =  moment().toISOString();

        // --------------------FORM LOGIN---------------------------------------------------------------------------------------
    const rawPayload = [
      {
        index: "logstash-*",
        ignore_unavailable: true,
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
      let formOptions = {
        method: "POST",
        uri: "https://accounts.sap.com/saml2/idp/sso",
        form: {
          // Like <input type="text" name="name">
          j_username: username,
          j_password: password
        },
        followRedirect: true,
        headers: {
          "content-type": "application/x-www-form-urlencoded"
        },
        resolveWithFullResponse: true
      };
      // rp(formOptions)
      //   .then(body => {
          
      //     console.log(body.response);
      //   })
      //   .catch(e => console.log(e));
        // ---------------------------------------------------------------------------------------------------------------------
      const authCookie = await retrieveCookie();
      const cookieJar = rp.jar();

      // console.log(authCookie)
      // maak zelf een cookie aan: https://stackoverflow.com/questions/42065364/how-do-you-handle-cookies-with-request-promise
      const cookie = new tough.Cookie({
        name: authCookie.name,
        value: authCookie.value,
        domain: authCookie.domain,
        path: authCookie.path, 
        expires: authCookie.expires,
        size: authCookie.size, 
        httpOnly: authCookie.httpOnly,
        secure: authCookie.secure,
        session: authCookie.session,
        url: authCookie.url
      });
      // console.log('content van nieuwe cookie: ', cookie)
      // console.log("tough cookie: ", cookie);
      // cookieJar.setCookie(cookie, authCookie.url);
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
          "kbn-xsrf": 'true', 
          "Cookie": `goauth-goauth-1=${authCookie.value}`
        },
        uri: "https://logs.cf.eu10.hana.ondemand.com/elasticsearch/_msearch",
        // uri:"https://logs.cf.eu10.hana.ondemand.com/",
        // jar: cookieJar, // tell rp to include cookies in jar that match uri
        resolveWithFullResponse: true,
        // json: true,
        body: rawPayload.map(JSON.stringify).join("\n") + "\n"
      };
      // console.log('ndjson: ',  rawPayload.map(JSON.stringify).join("\n") + '\n' )
      await rp(options)
        .then(data => {
          console.log("gegevens ontvangen");
          

          // console.dir( (body), {depth: null, colors:true})
          fs.writeFile("./tmp/requestLogs.json", (data.body))
            .then(() => {
              console.log("file saved");
            })
            .catch(error => console.error('error bij het wegschrijven van logs',error));
          return data;
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
      throw e;
      console.log(e);
    }
  });
};

// testen
// retrieveCookie().then(resolve => {
//   retrieveLogs()
//     .then(console.log)
//     .catch(e => {
//       if (e.message === "cookie has expired.") {
//       }
//     });
// });

const from = moment()
  .subtract("7", "days")
  .toISOString();
const to = moment().toISOString();
retrieveLogsRequest().then((resolve, reject) => {
  if (reject) {
    throw reject;
  }
  // console.log("resolve retrieved logs", resolve);
});
// const clip = clipboardy.readSync();

// fs.writeFile("./data/test.json", clip);

module.exports = {
  retrieveCookie: retrieveCookie,
  retrieveLogs: retrieveLogs
};
