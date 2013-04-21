var express = require('express');
var app = express();
var nano = require('nano')('http://localhost:5984');

var usersdb = nano.use('_users');
var appdb = nano.use('mm_guest_development');

var modelDoc = {
  language: "javascript",
  views: {
    all: {
      map: "function(doc) {\n  emit(doc.type, doc);\n}"
    },
    get: {
      map: "function(doc) {\n  if (/_/.test(doc.type)) {\n    emit([\n      doc.type, \n      doc[doc.type].split('_')[0]\n    ], doc);\n  } else {\n    emit([\n      doc.type,\n      doc._id\n    ], doc);\n  }\n}"
    }
  }
};

app.configure(function() {
  app.use(express.bodyParser());
  //app.use(app.router);
  app.use(express.cookieParser('shhhh, very secret'));
  app.use(express.session());
  app.use(express.static('./public'));
});

app.post('/api/signup', function(req, res) {
  var username = req.body.name;
  req.body.roles = [username];
  req.body.type = 'user';
  usersdb.insert(req.body, 'org.couchdb.user:' + username, function(err) {
    if (err) { return res.send(500, err); }
    nano.db.create('mm_' + username, function(err) {
      if (err) { return res.send(500, err); }
      var doc = { admins: { name: [], roles: []}, members: { names: [username], roles: []}};
      //appdb = nano.use('mm_' +username);
      // insert design document
      appdb.insert(modelDoc, '_design/model');
      appdb.insert(doc, '_security').pipe(res);
    });
  });
});

app.post('/api/login', function(req, res) {
  // authorize and set token or return 401
  //console.log(req.body);
  nano.auth(req.body.name, req.body.password, function(err, body, headers) {
    if (err) { return res.send(500, err); }
    req.session.user = body.name;
    req.session.appdb = 'mm_' + body.name;
    req.session[body.name] = headers['set-cookie'];
    // set database...
    res.send(200);
  });
});

app.post('/api/logout', restrict(), function(req, res) {
  // TODO - Need to handler logout right
  // req.session.destroy(function() {
  //   res.send(200);
  // });
  delete req.session.user;
  delete req.session.appdb;
  delete res.session[req.session.user];
  res.send(200);

});

app.get('/api/profile', restrict(), function(req, res) {
  usersdb.get('org.couchdb.user:' + req.session.user).pipe(res);
});

app.post('/api/:model', restrict(), function(req, res) {
  req.body.type = req.params.model;
  req.db.insert(req.body).pipe(res);
});

app.get('/api/:model', restrict(), function(req, res) {
  req.db.view('model', 'all', { key: req.params.model }).pipe(res);
});
app.get('/api/:model/:id', restrict(), function(req, res) {
  req.db.view('model', 'get', { key: [req.params.model, req.params.id], include_docs: true }).pipe(res);
});

app.put('/api/:model/:id', restrict(), function(req, res) {
  req.db.insert(req.body, req.params.id).pipe(res);
});

app.del('/api/:model/:id', restrict(), function(req, res) {
  req.db.destroy(req.params.id, req.query.rev).pipe(res);
});

app.get(/(?!\.)/, function(req, res) {
  res.sendfile('./public/index.html');
});

function restrict() {
  return function(req, res, next) {
    if (req.session.user) {
      req.db = nano.use(req.session.appdb);
      next();
    } else {
      res.send(401, { message: 'Unauthorized: must be logged in to request this funciton!'});
    }
  };
}

app.listen(3000);