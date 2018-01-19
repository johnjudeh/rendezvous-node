const passportLocalMongoose = require('passport-local-mongoose');
      expressSession        = require('express-session'),
      LocalStrategy         = require('passport-local').Strategy,
      bodyParser            = require('body-parser'),
      passport              = require('passport'),
      mongoose              = require('mongoose'),
      express               = require('express'),
      app                   = express();

// mongoose.connect('mongodb://localhost/rendez_vous');
mongoose.connect('mongodb://localhost/demo');
const db = mongoose.connection;

db.on('error', console.error.bind(console));
db.once('open', () => {
  // console.log('rendez_vous db connected!');
  console.log('demo db connected!');
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
  // interests: Array,
  // lastKnownLocation: Object
});
// Adds the needed passport methods to Schema
userSchema.plugin(passportLocalMongoose
  // , {
  // usernameField: 'email',
  // usernameLowerCase: true,
  // limitAttempts: true,
  // maxAttempts: 5
  // }
);
const User = mongoose.model('User', userSchema);


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
// Sets directory to serve static files
// can be accessed from root route eg. /stylesheets/app.css
app.use(express.static('public'));

// Passport middleware added
app.use(passport.initialize());
app.use(passport.session());
app.use(expressSession({
   secret: 'emelda is a babe',
   resave: false,
   saveUninitialized: false
}));
// passport.use(new LocalStrategy(User.authenticate()));
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/maps', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {
  // Retrieve data from form
  const newUser = new User({username: req.body.user.email});
  console.log(newUser);
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      console.log('Welcome to Rendez Vous');
      console.log(user);
      req.redirect('/maps');
    })

  })
  // Save data to database

  // Sign in user

  // Redirect to /maps
  res.redirect('/maps')
})

app.get('/login', (req, res) => {
  res.render('login');
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
