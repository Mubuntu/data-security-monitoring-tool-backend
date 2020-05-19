const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/indexRouter");
const logRouter = require("./routes/logRouter");
const whitelistRouter = require("./routes/whitelistRouter");

const app = express();

const jobs = require("./cron/jobs");

const moment = require("moment");
const logRetrieval = require("./utils/logRetrieval");
// set environment variables:
require("dotenv").config();
// console.log("username: ", process.env["cf_user"]);
//check of waarden zijn opgehaald:
if (!process.env["cf_user"] && !process.env["cf_password"]) {
  throw new Error("application does not contain environment variables");
}

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

app.use(logger("production"));
// app.use(express.urlencoded());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/logs", logRouter);
app.use("/whitelist", whitelistRouter);
app.use(express.static(path.join(__dirname, "public")));

// haal alle logs op in de laatste 30 dagen.
const from = moment().subtract("30", "day");
const to = moment();

logRetrieval(from, to);

// start cronjobs
jobs.start();

// initialiseDB()

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // res.locals.error = req.app.get("env") === "development" ? err : {};
  res.locals.error = req.app.get("env") === "development" ? err : err;

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// "11-3-2020 16:00"
// const datum = moment("11-3-2020 16:00", "DD-MM-YYYY HH:mm");
// const compDate = moment("2020-03-11T14:16:21.467Z", "YYYY-MM-DDTHH:mm:ss.SSSZ");
// console.log(datum.isAfter(compDate));
// no need 'const app = require('../app');' any more, cause it has defined in 'app.js' already.
const debug = require("debug")("data-security-monitoring-tool-backend");
app.set("port", process.env.PORT || 4000);
const server = app.listen(app.get("port"), function () {
  console.log("Express server listening on port " + server.address().port);
  debug("Express server listening on port " + server.address().port);
});

module.exports = app;
