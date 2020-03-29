"use strict";
const path = require("path");
const testEnv = path.join(__dirname, "");
require("dotenv").config();
console.log(testEnv);
// const request = require('supertest')
const request = require("request-promise");
const url =
  "https://express-demo-app-relaxed-wolf-mx.cfapps.eu10.hana.ondemand.com";
let authToken = "";

describe("create logs for demo-express-app", () => {
  it("should retrieve a list of users", async () => {
    const options = {
      method: "GET",
      uri: ` ${url}/users`,
      resolveWithFullResponse: true
    };
    await request(options).then(res => {
      const arr = JSON.parse(res.body);
      const isArray = Array.isArray(arr);
      // console.log(arr)
      expect(isArray).toBe(true);
    });
  });

  it("should retrieve a user named tester", async () => {
    const options = {
      method: "GET",
      uri: ` ${url}/users/e6b84063-2ecd-4f0f-bcb4-11dc3e52c87d`,
      auth: {
        bearer: authToken
      },
      resolveWithFullResponse: true
    };

    await request(options).then(res => {
      const msg = JSON.parse(res.body).message;
      // console.log(msg);

      expect(msg).toBe("user found in db");
    });
  });

  it("should login a user in", async () => {
    const options = {
      method: "POST",
      resolveWithFullResponse: true,
      uri: `${url}/login`,
      qs: {
        username: process.env.express_demo_user,
        password: process.env.express_demo_password
      }
    };

    await request(options).then(response => {
      console.log(response.body.token);
      authToken = response.body.token;
      expect(response.statusCode).toBe(200);
    });
  });

  it("should not retrieve a user named tester", async () => {
    const options = {
      method: "GET",
      uri: ` ${url}/users/e6b84063-2ecd-4f0f-bcb4-11dc3e52c87d`,
      resolveWithFullResponse: true
    };

    await request(options)
      .then(res => {})
      .catch(err => {
        if (err) console.log(err.statusCode);
        expect(err.statusCode).toBe(401);
      });
  });
});
