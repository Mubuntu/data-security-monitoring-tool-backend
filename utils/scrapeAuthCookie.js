const puppeteer = require("puppeteer");
const fs = require("fs").promises;
const cookiePath = "./data/cookies.json";
const moment = require("moment");
const clipboardy = require("clipboardy");
const rp = require("request-promise");
const tough = require("tough-cookie");
const Cookie = tough.Cookie;
const username = "patrick.frison@amista.be";
const password = "N6Dq5*E$tvkz";

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
      console.log("function retrieveCOokie", e);
      return reject(e);
    }
  });
};

module.exports = retrieveCookie;
