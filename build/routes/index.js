'use strict';

var passport = require('passport'),
    express = require('express'),
    router = express.Router({ mergeParams: true }),
    User = require('../models/user');

// Sets user preferences to narrow down seach
var funPlaceTypes = [{ type: 'amusement_park', category: 'Adventure' }, { type: 'aquarium', category: 'Attractions' }, { type: 'art_gallery', category: 'Smarts & Arts' }, { type: 'bakery', category: 'Out & About' }, { type: 'bar', category: 'Night Life' }, { type: 'beauty_salon', category: 'Wellness' }, { type: 'book_store', category: 'Smarts & Arts' }, { type: 'bowling_alley', category: 'Night Life' }, { type: 'cafe', category: 'Out & About' }, { type: 'campground', category: 'Adventure' }, { type: 'car_rental', category: 'Adventure' }, { type: 'casino', category: 'Attractions' }, { type: 'gym', category: 'Wellness' }, { type: 'library', category: 'Smarts & Arts' }, { type: 'movie_theater', category: 'Night Life' }, { type: 'museum', category: 'Attractions' }, { type: 'night_club', category: 'Night Life' }, { type: 'park', category: 'Attractions' }, { type: 'restaurant', category: 'Out & About' }, { type: 'rv_park', category: 'Adventure' }, { type: 'shopping_mall', category: 'Out & About' }, { type: 'spa', category: 'Wellness' }, { type: 'stadium', category: 'Attractions' }, { type: 'zoo', category: 'Attractions' }];

router.get('/', function (req, res) {
  res.set('Cache-control', 'no-cache');
  res.render('index');
});

router.get('/register', function (req, res) {
  res.set('Cache-control', 'no-cache');
  res.render('register', { funPlaceTypes: funPlaceTypes });
});

router.post('/register', function (req, res, next) {
  var newUser = new User(req.body.user);

  User.register(newUser, req.body.password, function (err, user) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }
    req.flash('success', 'Successfully registered!');
    res.redirect('/login');
  });
});

router.get('/login', function (req, res) {
  res.set('Cache-control', 'no-cache');
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true,
  successRedirect: '/'
}));

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'Successfully logged out!');
  res.redirect('/');
});

module.exports = router;