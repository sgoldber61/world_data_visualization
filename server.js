var express = require('express');
var path = require('path');
var app = express();

app.use(express.static(__dirname));

app.get('/force-directed', function (req, res) {
 res.sendFile(path.resolve(__dirname, 'force_directed', 'index.html'));
});

app.get('/world-meteorite', function (req, res) {
 res.sendFile(path.resolve(__dirname, 'world_meteorite', 'index.html'));
});

app.get('*', function(req, res) {
  res.redirect('/world-meteorite');
});

app.listen(process.env.PORT || 3000);
