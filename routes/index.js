const passport  = require("passport"),
      express   = require('express'),
      router    = express.Router({mergeParams: true}),
      User      = require("../models/user");

// Sets user preferences to narrow down seach
const funPlaceTypes = [
  'amusement_park','aquarium','art_gallery','bakery','bar','beauty_salon',
  'book_store','bowling_alley','cafe','campground','car_rental','casino','gym',
  'library','movie_theater','museum','night_club','park','restaurant','rv_park',
  'shopping_mall','spa','stadium','zoo'
];

router.get('/', (req, res) => {
  res.set('Cache-control', 'no-cache');
  res.render('landing');
});

router.get('/maps', (req, res) => {
  res.set('Cache-control', 'no-cache');
  res.render('index');
});

router.get('/register', (req, res) => {
  res.set('Cache-control', 'no-cache');
  res.render('register', { funPlaceTypes: funPlaceTypes });
})

router.post('/register', (req, res, next) => {
  const newUser = new User(req.body.user);

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    req.flash('success', 'Successfully registered!');
    res.redirect('/login');
  })
});

router.get('/login', (req, res) => {
  res.set('Cache-control', 'no-cache');
  res.render('login');
})

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true,
    successRedirect: '/maps'
}));

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/maps');
})

module.exports = router;
