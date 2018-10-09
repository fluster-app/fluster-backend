var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');

// DB
var db = require('./config/db');

// Amazon
var amazon = require('./config/amazon');

// Internationalization
require('./config/i18n');

// Don't include securityTokens
// var securityTokens = require('./model/securityToken');
// var device = require('./model/device');

require('./model/users');
require('./model/subscriptions');
require('./model/items');
require('./model/appointments');
require('./model/notifications');
require('./model/chats');
require('./model/itemUsers');
require('./model/complaints');
require('./model/rewards');

// The Application
var app = express();

app.use(logger('dev'));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

require('./config/parser')(app);

// Routes
module.exports.app = app;

// Login routes
var handlers = require('./routes/handlers');

require('./routes/items');
require('./routes/likes');
require('./routes/uploadImages');
require('./routes/yelp');
require('./routes/facebookMutualFriends');
require('./routes/google');
require('./routes/appointments');
require('./routes/itemStars');
require('./routes/itemUsers');
require('./routes/notifications');
require('./routes/chats');
require('./routes/devices');
require('./routes/statistics');
require('./routes/complaints');
require('./routes/profiles');
require('./routes/pushNotifications');
require('./routes/admin');
require('./routes/products');
require('./routes/subscriptions');
require('./routes/candidates');
require('./routes/spotify');
require('./routes/educations');
require('./routes/employers');
require('./routes/rewards');

// Public routes
require('./routes/public');

// Log4js

var log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'console' },
        default: { type: 'dateFile', filename: '/var/log/node/peterparker-', "pattern":"yyyy-MM-dd.log", alwaysIncludePattern:true}
    },
    categories: {
        default: { appenders: ['out','default'], level: 'info' }
    }
});

// Cron
require('./cronjobs/cronjobs');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
        error: "Uncaught exception: " + err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
      error: "Uncaught exception: " + err
  });
});


module.exports = app;
