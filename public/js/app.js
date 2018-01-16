const express = require('express'),
      app     = express(),

      // to be used in .static when you version filenames based on content
      options = {
        etag: true,
        // immutable: true,
        // maxAge: 31536000,
        setHeaders: (res, path, stat) => {
          res.set({
            'Cache-Control': 'no-cache'
          })
        }
      };

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
