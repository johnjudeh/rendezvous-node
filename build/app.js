'use strict';

require('babel-polyfill'); // Polyfills needed APIs

var expressSession = require('express-session'),
    LocalStrategy = require('passport-local').Strategy,
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    express = require('express'),
    routes = require('./routes/index'),
    flash = require('connect-flash'),
    User = require('./models/user'),
    app = express();

// Connects to mongoDB
mongoose.connect('mongodb://localhost/rendez_vous').then(function () {
  console.log('rendez_vous db connected!');
}).catch(function (err) {
  console.error(err);
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public', {
  etag: true, // generates etag automatically
  lastModified: true, // sets last-modified on os
  maxAge: 31536000000, // time in ms (not s)
  immutable: true,
  setHeaders: function setHeaders(res, path, stat) {
    // Ensures service worker always validated with server
    if (path.indexOf('sw') >= 0) {
      res.set('Cache-control', 'no-cache');
    }
  }
}));
app.use(flash());

// Passport configuration
app.use(expressSession({
  secret: 'emelda is a babe',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware - used on every route
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Tells the application to use defined routes
app.use('/', routes);

app.listen(8080, function () {
  console.log('Rendez-Vous Server ---> ON');
  console.log('Listening on localhost:8080');
});