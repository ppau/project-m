'use strict';

const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan'),
      bodyParser = require('body-parser'),
      expressSanitized = require('express-sanitized'),
      helmet = require('helmet'),
      routes = require('./routes/index'),
      sassMiddleware = require('node-sass-middleware'),
      session = require('express-session'),
      passport = require('passport'),
      passportConfig = require("./config/passport"),
      neat = require('node-neat'),
      app = express(),
      configManager = require('./config/configManager'),
      SequelizeSessionStore = require('connect-session-sequelize')(session.Store),
      db = require('./db/connection'),
      sessionStore = new SequelizeSessionStore({db: db}),
      sessionOpts = configManager.session,
      env = process.env.NODE_ENV || 'development',
      membershipRenewalJob = require('./services/membershipRenewalService');

sessionStore.sync();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(helmet());
app.use(logger(configManager.logFormat));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitized());
app.use(session({
    secret: sessionOpts.secret,
    store: sessionStore,
    proxy: sessionOpts.proxy,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: sessionOpts.secureCookie }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    debug: true,
    outputStyle: 'compressed',
    includePaths: neat.includePaths
}), express.static(path.join(__dirname, 'public')));

app.use('/', routes);

app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((error, req, res, next) => {
    require('./lib/logger').logError(error.stack, '[general-application-error]');
    res.status(error.status || 500);
    res.render('error');

    next(error);
});

membershipRenewalJob.start();

module.exports = app;
