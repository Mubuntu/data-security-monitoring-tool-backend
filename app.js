const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/logRouter');
const usersRouter = require('./routes/users');
const app = express();

// set environment variables: 
require('dotenv').config({path: __dirname+ "/data/.env"})
console.log('username: ', process.env['USER'])
//check of waarden zijn opgehaald: 
if(!process.env['USER'] && !process.env['PASSWORD']){
  throw new Error('application does not contain environment variables')
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// no need 'const app = require('../app');' any more, cause it has defined in 'app.js' already.
const debug = require('debug')('data-security-monitoring-tool-backend');
app.set('port', process.env.PORT || 4000);
const server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

module.exports = app;
