'use strict';

var express = require('express'),
    app = express();

// import serviceWorker from './sw/index.js'

app.set('view engine', 'ejs');
// Sets directory to serve static files
// can be accessed from root route eg. /stylesheets/app.css
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.render('landing');
});

app.get('/maps', function (req, res) {
  res.render('index');
});

app.listen(8080, function () {
  console.log('Mapper Server ---> ON');
  console.log('listening on localhost:8080');
});