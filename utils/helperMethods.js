const dataPath = "./db/logsDB.json";
const fs = require("fs");
// helper methods
const readFile = (
  callback,
  returnJson = true,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.readFile(filePath, encoding, (err, data) => {
    if (err) {
      console.log("error bij het lezen van bestand", err);
      throw err;
    }
    data === "" ? (data = {}) : data;
    callback(returnJson ? JSON.parse(data) : data);
  });
};

const writeFile = (
  fileData,
  callback,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.writeFile(filePath, fileData, encoding, (err) => {
    if (err) {
      console.log("File read failed", err);
      throw err;
    }
    // console.log("logs weggeschreven naar bestand");
    callback();
  });
};

module.exports = {
  readFile,
  writeFile,
};
