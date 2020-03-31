const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/logRouter");
const app = express();

const jobs = require("./cron/jobs");

// set environment variables:
// require("dotenv").config({ path: __dirname + "/data/.env" });
require("dotenv").config();
console.log("username: ", process.env["USER"]);
//check of waarden zijn opgehaald:
if (!process.env["USER"] && !process.env["PASSWORD"]) {
  throw new Error("application does not contain environment variables");
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// start cronjobs
jobs.start();
app.use("/", indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

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
const server = app.listen(app.get("port"), function() {
  debug("Express server listening on port " + server.address().port);
});

module.exports = app;
