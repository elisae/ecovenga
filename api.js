module.exports = function(config) {
  var router = require('express').Router();
  var mongoose = require('mongoose');
  var db_url = require('./backend/db/config.js')(config); // local or docker
  var auth = require('./backend/auth/auth.js');

  console.log("Connecting to db with URL '" + db_url + "'");

  mongoose.Promise = global.Promise;

  //TODO: db-user auth
  mongoose.connect(db_url, function(err) {
    if (err) {
      console.log(err);
    }
  })

  var api = require('./backend/db-functions.js')(mongoose);

  function isLoggedIn(req, res, next) {
    if (auth.checkToken(req.header('authToken'))) {
      next();
    } else {
      res.json({
        success: false,
        error: 'Authentication failure: Please provide authToken'
      });
    }
  }

  router.use(function(req, res, next) {
    console.log(req.method + " /api" + req.url);
    next();
  });

  router.use('/events', isLoggedIn);
  router.use('/users', isLoggedIn);
  router.use('/items', isLoggedIn);

  router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the Ecovenga API' });
  });

  router.post('/login', function(req, res) {
    console.log(req.body);
    var password = auth.hash(req.body.password); // TODO: actually hash
    api.getUserByName(req.body.username, function(err, user) {
      if (err) {
        return callback(err);
      }
      if (!user) {
        res.json({
          success: false,
          error: "Login failure",
          message: "User not found",
          username: req.body.username
        });
      } else if (user.password != password) {
        res.json({
          success: false,
          error: "Login failure",
          message: "Wrong password",
          username: req.body.username
        });
      } else {
        var token = auth.generateToken();

        res.json({
          success: true,
          message: "Succesfully logged in",
          user: user,
          authToken: token
        });
      }
    });
  });

  router.route('/users')
    .get(function(req, res) {
      api.getUsers(function(data) {
        res.json(data);
      });
    });

  router.route('/users/:id')
    .get(function(req, res) {
      api.getUserById(req.params.id, function(data) {
        res.json(data);
      });
    })
    .put(function(req, res) {
      api.updateUser(req.params.id, req.body, function(data) {
        res.json(data);
      });
    });

  router.route('/users/:id/events')
    .get(function(req, res) {
      api.getUserEvents(req.params.id, function(data) {
        res.json(data);
      });
    });

  router.route('/events')
    .get(function(req, res) {
      var token = req.header("authToken");
      var user_id = req.query.user;
      if (user_id) {
        api.getUserEvents(user_id, function(data) {
          res.json(data);
        })
      } else {
        api.getEvents(function(data) {
          res.json(data);
        });
      }
    })
    .post(function(req, res) {
      api.createEvent(req.body, function(data) {
        res.json(data);
      })
    });

  router.route('/events/:id')
    .get(function(req, res) {
      api.getEventById(req.params.id, function(data) {
        res.json(data);
      });
    })
    .put(function(req, res) {
      api.updateEvent(req.params.id, req.body, function(data) {
        res.json(data);
      });
    })
    .delete(function(req, res) {
      api.deleteEvent(req.params.id, function(data) {
        res.json(data);
      });
    });

  router.route('/events/:event_id/participants/:participant_id')
    .put(function(req, res) {
      api.addParticipant(req.params.event_id, req.params.participant_id, function(data) {
        res.json(data);
      });
    })
    .delete(function(req, res) {
      api.removeParticipant(req.params.event_id, req.params.participant_id, function(data) {
        res.json(data);
      });
    });

  router.route('/items')
    .post(function(req, res) {
      api.createItem(req.body, function(data) {
        res.json(data);
      })
    })
    .get(function(req, res) {
      api.getItems(function(data) {
        res.json(data);
      });
    });

  router.route('/items/:id')
    .put(function(req, res) {
      api.updateItem(req.params.id, req.body, function(data) {
        res.json(data);
      })
    })
    .delete(function(req, res) {
      api.deleteItem(req.params.id, function(data) {
        res.json(data);
      });
    });

  router.shutdown = function() {
    api.shutdown();
  }

  return router;
}
