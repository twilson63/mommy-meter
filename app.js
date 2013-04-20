var express = require('express');
var app = express();
var nano = require('nano')('http://localhost:5984');

nano.db.create('mm_guest_development');
var userdb = nano.use('mm_guest_development');

app.configure(function() {
  app.use(express.bodyParser());
  //app.use(express.router);
  app.use(express.static('./public'));
});

app.post('/api/:model', function(req, res) {
  req.body.type = req.params.model;
  userdb.insert(req.body).pipe(res);
});

app.get('/api/:model', function(req, res) {
  //userdb.list.pipe(res);
  userdb.view('model', 'all', { key: req.params.model }).pipe(res);
});
app.get('/api/:model/:id', function(req, res) {
  userdb.view('model', 'get', { key: [req.params.model, req.params.id] }).pipe(res);
});

app.put('/api/:model/:id', function(req, res) {
  userdb.insert(req.body, req.params.id).pipe(res);
});

app.del('/api/:model/:id', function(req, res) {
  userdb.destroy(req.params.id, req.query.rev).pipe(res);
});

app.get(/(?!\.)/, function(req, res) {
  res.sendfile('./public/index.html');
});


app.listen(3000);