const passportLocalMongoose  = require('passport-local-mongoose'),
      expressSession         = require('express-session'),
      LocalStrategy          = require('passport-local').Strategy,
      bodyParser             = require('body-parser'),
      passport               = require('passport'),
      mongoose               = require('mongoose'),
      express                = require('express'),
      flash                  = require('connect-flash'),
      app                    = express();

// mongoose.connect('mongodb://localhost/rendez_vous').then(() => {
mongoose.connect('mongodb://localhost/demo').then(() => {
  // console.log('rendez_vous db connected!');
  console.log('demo db connected!');
}).catch((err) => {
  console.error(err);
});

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  dob: Date,
  address: {
    street: String,
    city: String,
    postCode: String,
    country: String
  },
  interests: Object
  // lastKnownLocation: Object
});
// Adds the needed passport methods to Schema
userSchema.plugin(passportLocalMongoose);
  // , {
  // usernameField: 'email'
  // usernameLowerCase: true,
  // limitAttempts: true,
  // maxAttempts: 5
const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// Sets directory to serve static files
// can be accessed from root route eg. /stylesheets/app.css
app.use(express.static('public'));
app.use(flash());

// Passport middleware added
app.use(expressSession({
   secret: 'emelda is a babe',
   resave: false,
   saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
  // {usernameField: 'email'},
// passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success     = req.flash('success');
  res.locals.error       = req.flash('error');
  next();
})

const funPlaceTypes = [
  'amusement_park',
  'aquarium',
  'art_gallery',
  'bakery',
  'bar',
  'beauty_salon',
  // 'bicycle_store',
  'book_store',
  'bowling_alley',
  'cafe',
  'campground',
  'car_rental',
  'casino',
  'gym',
  // 'hair_care',
  'library',
  // 'lodging',
  'movie_theater',
  'museum',
  'night_club',
  'park',
  'restaurant',
  'rv_park',
  'shopping_mall',
  'spa',
  'stadium',
  // 'travel_agency',
  'zoo'
];

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/maps', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register', { funPlaceTypes: funPlaceTypes });
})

app.post('/register', (req, res, next) => {
  // const newUser = new User({username: req.body.user.email});
  const newUser = new User(req.body.user);
  // console.log(newUser);
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log('Error registering user:', err);
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    console.log('User registered:', user);
    req.flash('success', 'Successfully registered!');
    res.redirect('/login');
  })
});

app.get('/login', (req, res) => {
  res.render('login');
})

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/maps'
}));

app.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/maps');
})

app.listen(8080, () => {
  console.log('Rendez-Vous Server ---> ON');
  console.log('Listening on localhost:8080');
});


// ARCHIVES - USE ME LATER

// To be used in .static when you version filenames based on content
// options = {
//   etag: true,
//   // immutable: true,
//   // maxAge: 31536000,
//   setHeaders: (res, path, stat) => {
//     res.set({
//       'Cache-Control': 'no-cache'
//     })
//   }
// };
