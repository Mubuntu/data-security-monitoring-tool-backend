const puppeteer = require("puppeteer");
const fs = require("fs").promises;
// const cookiePath = "./tmp/sap-cloud-cookie.json";
const username = process.env["cf_user"] || "patrick.frison@amista.be";
const password = process.env["cf_password"] || "N6Dq5*E$tvkz";

const retrieveCookie = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const browser = await puppeteer.launch({
        // In order to protect the host environment from untrusted web content, Chrome uses multiple layers of sandboxing. 
        // For this to work properly, the host should be configured first. If there's no good sandbox for Chrome to use, it will crash with the error
        // https://github.com/puppeteer/puppeteer/blob/master/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
      // fs.writeFile(cookiePath, JSON.stringify(cookies, null, 2));

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
