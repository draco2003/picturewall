// require Express and Socket.io
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
var config = require('./config.js');

// the object that will hold information about the active screens currently
var screenData = {};
// This is a mapping between sockets and screens for easy lookup
var socketScreenMap = {};

var images = [{
          "src": '/img/1.jpg',
          'thumb': '/img/thumb-1.jpg',
          'subHtml': 'Caption'
        }, {
          'src': '/img/2.jpg',
          'thumb': '/img/thumb-2.jpg',
          'subHtml': "Caption 2"
        }, {
          'src': '/img/3.jpg',
          'thumb': '/img/thumb-3.jpg',
          'subHtml': "<h4>Coniston Calmness</h4><p>Beautiful morning</p>"
        }];


app.set('port', (process.env.PORT || 5000));

// serve the static assets (js/dashboard.js and css/dashboard.css)
// from the public/ directory
app.use(express.static(path.join(__dirname, 'public/')));

// serve the index.html page when someone visits any of the following endpoints:
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

// serve up the dashboard when someone visits /dashboard
app.get('/remote', function(req, res) {
  res.sendFile(path.join(__dirname, 'views/remote.html'));
});

io.on('connection', function(socket) {
  if (socket.handshake.headers.referer.indexOf(config.dashboardEndpoint) > -1) {
    socket.join('remote');
    io.emit('remote-screens', screenDetails());
  } else {
    socket.on('screen-settings', function(data) {
      screen_id = standardizeId(data.room, data.name);
      data.id = socket.id;
      socketScreenMap[socket.id] = screen_id;
      screenData[screen_id] = data;
      io.in('remote').emit('remote-screens', screenDetails());
      socket.emit('slideshow-images', images);
    });
  }

  // Slideshow Controls
  socket.on('remote-action', function(data) {
    io.to(data.client).emit('slideshow-control', data.action);
  }); 

  socket.on('disconnect', function() {
    // On Disconnect remove screen from available list
    delete screenData[socketScreenMap[socket.id]];
    delete socketScreenMap[socket.id];
    io.emit('remote-screens', screenDetails());
  });
});

function standardizeId(room, name) {
  screen_id = room + ':' + name;
  return screen_id.replace(" ","_");
}

function screenDetails() {
  return {
    screens : screenData
  }
}

http.listen(app.get('port'), function() {
  console.log('listening on *:' + app.get('port'));
});