var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , stylus = require('stylus')
  , nib = require('nib');

app.configure(function() {
  app.use(stylus.middleware({
      src: __dirname + '/theme',
      dest: __dirname + '/public',
      compile: function (str, path) {
        return stylus(str)
          .set('filename', path)
          .set('compress', true)
          .set('warn', true)
          .use(nib());
      }
  }));
  app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/template.html');
});

var hash = false;

io.sockets.on('connection', function (socket) {
  socket.on('message', function(type, data) {
    console.log(data);
    socket.broadcast.emit('event', data);
    if (hash) {
      socket.broadcast.to(hash).emit(data);
    } else {
      socket.broadcast.send(data);
    }
  });

  socket.on('next', function () {
      io.sockets.in(hash).emit('next');
  });
  socket.on('prev', function () {
      io.sockets.in(hash).emit('prev');
  });
  socket.on('reset', function () {
      io.sockets.in(hash).emit('reset');
  });
  socket.on('start', function () {
      io.sockets.in(hash).emit('start');
  });

  /* Emit to the client the number of the slide required */
  socket.on('gotoslide', function (data) {
    io.sockets.in(hash).emit('gotoslide',{ slide : data.slide });
  });

  socket.on('requestSync', function (key) {
    socket.join(key);
    hash = key;
    socket.broadcast.to(hash).emit('sync');
    io.sockets.in(hash).emit('sync');
  });
});

/*
 * Start server
 */

server.listen(process.env.PORT || 3000, function () {
  console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
});
