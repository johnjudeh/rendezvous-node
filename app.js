const express = require('express'),
      app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));    //sets the public directory to serve 

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/maps', (req, res) => {
  res.render('index');
});

app.listen(8080, () => {
  console.log('Mapper Server ---> ON');
  console.log('listening on localhost:8080');
});
