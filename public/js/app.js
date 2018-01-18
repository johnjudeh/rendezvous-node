const mongoose  = require('mongoose'),
      express   = require('express'),
      app       = express();

mongoose.connect('mongodb://localhost/rendez_vous');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,

});

const User = mongoose.model('User', userSchema);

// SHOULDN'T NEED EITHER DUE TO NEW VERSION
// mongoose.Promise = global.Promise;
// mongoose.connect("mongodb://localhost/yelp_camp", {useMongoClient: true});

app.set('view engine', 'ejs');
// Sets directory to serve static files
// can be accessed from root route eg. /stylesheets/app.css
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/maps', (req, res) => {
  res.render('index');
});

app.listen(8080, () => {
  console.log('Mapper Server ---> ON');
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
