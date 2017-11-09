if (process.argv.length <= 2) {
  console.log("Please provide a CONFIG as third argument: 'docker' or 'local'");
  process.exit(-1);
}
var config = process.argv[2];
console.log("Started server with config '" + config + "'");
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var api = require('./api.js')(config);

app.use(express.static('./frontend/public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// BACKEND - handle all "/api/..." routes
app.use('/api', api);

// FRONTEND
// - serve node_modules
app.use('/node_modules', express.static('node_modules'));

// - forward all other routes to Angular
app.get('*', function(req, res) {
  console.log(req.method + " " + req.url);
  try {
    res.sendFile(__dirname + "/public/index.html");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

var server = app.listen(8080, function() {
  console.log('Server is listening on port 8080');
});

function shutdown() {
  console.log("Received kill signal, shutting down gracefully.");
  api.shutdown();
  server.close(function() {
    console.log("Closed out remaining connections.");
    process.exit()
  });

  setTimeout(function() {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit()
  }, 10*1000);
}

process.on ('SIGTERM', shutdown);
process.on ('SIGINT', shutdown);
