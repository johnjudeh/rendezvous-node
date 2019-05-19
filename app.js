require('babel-polyfill');   // Polyfills needed APIs

const expressSession         = require('express-session'),
      LocalStrategy          = require('passport-local').Strategy,
      bodyParser             = require('body-parser'),
      passport               = require('passport'),
      mongoose               = require('mongoose'),
      express                = require('express'),
      routes                 = require('./routes/index'),
      flash                  = require('connect-flash'),
      User                   = require('./models/user'),
      app                    = express();

// Configure port for production & dev
const port = process.env.PORT || 8080;

// Connects to mongoDB
mongoose.connect(process.env.RV_DB_URL).then(() => {
  console.log('rendez_vous db connected!');
}).catch((err) => {
  console.error(err);
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(`${__dirname}/public`, {
  etag: true,             // generates etag automatically
  lastModified: true,     // sets last-modified on os
  maxAge: 31536000000,    // time in ms (not s)
  immutable: true,
  setHeaders: (res, path, stat) => {
    // Ensures service worker always validated with server
    if (path.indexOf('sw') >= 0) {
      res.set('Cache-control', 'no-cache');
    }
  }
}));
app.use(flash());

// Passport configuration
app.use(expressSession({
   secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware - used on every route
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success     = req.flash('success');
  res.locals.error       = req.flash('error');
  res.locals.MAPS_KEY    = process.env.MAPS_KEY;
  next();
});

// Tells the application to use defined routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Rendez-Vous Server ---> ON`);
  console.log(`Listening on port: ${port}`);
});
