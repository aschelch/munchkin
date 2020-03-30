var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('munchkin:server');
var http = require('http');
var SocketIO = require('socket.io');

const Utils = require('./lib/Utils');
const HashMap = require('hashmap');
const Game = require('./lib/Game');


var games = new HashMap();


var app = express();
var debug = require('debug')('munchkin:server');
var http = require('http');

var port = Utils.normalizePort(process.env.PORT || '3000');
app.set('port', port);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res, next) {
  res.render('index', { title: 'Munchkin Online' });
});

app.get('/:id', function(req, res, next) {
  var gameId = req.params.id

  var game;
  if( ! games.has(gameId)){
    //res.redirect('/')
    //return;
      //TODO For dev only
      game = new Game(gameId, 0, "Test")
      games.set(game.id, game);
      broadcastGameList();
  }

  game = games.get(gameId);

  res.render('game', {game : game, title: 'Munchkin Online' });
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


function broadcastGameList(){
  gameList = [];
  games.forEach(game => {
    if(game.isPrivate()){
       return;
    }
    gameList.push({
      uid : game.id,
      name : game.name,
      nbPlayers : game.players.size
    });
  }); 
  io.sockets.emit('game-list', gameList);
}

function broadcastPlayersList(game){
  io.to(game.id).emit('player-list', game.getPlayers());
}

const io = SocketIO(server);

io.on('connection', function(socket) {
    debug('New socket connected : ' + socket.id)




    broadcastGameList();
  
    socket.on('new-private-game', (data) => {
      var game = Game.createPrivate(data);
      games.set(game.id, game);
      socket.emit('game-created', game.id);
      broadcastGameList();
    });

    socket.on('new-public-game', (data) => {
      var game = Game.createPublic(data);
      games.set(game.id, game);
      socket.emit('game-created', game.id);
      broadcastGameList();
    });






    socket.on('join-game', (data) => {
      debug('Player join game '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      socket.join(data.gameId);

      var game = games.get(data.gameId);
      var playerId = game.addPlayer(socket, data);
      
      socket.emit('game-joined', playerId);
      broadcastGameList();
    });

    socket.on('take-door-card', (data) => {
      debug('Player take a door card '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.playerTakeDoorCard(data.playerId);
      broadcastPlayersList(game);
    });

    socket.on('take-treasure-card', (data) => {
      debug('Player take a treasure card '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.playerTakeTreasureCard(data.playerId);
      broadcastPlayersList(game);
    });

    socket.on('open-door', (data) => {
      debug('Player open door '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.playerOpenDoor(data.playerId);
      broadcastPlayersList(game);
    });


    socket.on('play-card', (data) => {
      debug('Player play a card '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.playerPlayCard(data.playerId, data.cardId);
      broadcastPlayersList(game);
    });

    socket.on('discard-hand-card', (data) => {
      debug('Player discard a card '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.discardHandCard(data.playerId, data.cardId);
      broadcastPlayersList(game);
    });

    socket.on('discard-board-card', (data) => {
      debug('Player discard a card from his board '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.discardBoardCard(data.playerId, data.cardId);
      broadcastPlayersList(game);
    });

    socket.on('give-hand-card', (data) => {
      debug('Player give a card '+data.gameId);
      
      if( ! games.has(data.gameId)){ 
        return;
      }

      console.log(data);

      var game = games.get(data.gameId);
      game.giveHandCard(data.playerId, data.cardId, data.givenPlayerId);
      broadcastPlayersList(game);
    });

    socket.on('increase-level', (data) => {
      debug('Player level increased '+data.gameId);
      
      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.increasePlayerLevel(data.playerId, data.givenPlayerId);
      broadcastPlayersList(game);
    });

    socket.on('decrease-level', (data) => {
      debug('Player level increased '+data.gameId);
      
      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.decreasePlayerLevel(data.playerId, data.givenPlayerId);
      broadcastPlayersList(game);
    });
    

    socket.on('roll-dice', (data) => {
      debug('Roll a dice '+data.gameId);

      if( ! games.has(data.gameId)){ 
        return;
      }

      var game = games.get(data.gameId);
      game.rollDice(data.playerId);
    });

    
    socket.on('disconnect', () => {

      games.forEach(game => {
        game.disconnectPlayer(socket.id);    
        broadcastPlayersList(game);
      });
      broadcastGameList();
    })

});

module.exports = app;



/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
