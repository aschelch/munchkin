var socket = io.connect('http://localhost:3000');


socket.on('connection', function(socket) {
    console.log('New socket connected : ' + socket.id)
});


socket.on('message', function(data) {
    console.log(data);
  });