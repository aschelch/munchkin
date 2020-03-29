const HashMap = require('hashmap');
const Player = require('./Player');
const Stack = require('./Stack');
const debug = require('debug')('munchkin:game');
const shortid = require('shortid');


const deck = require('./data/munchkin.json');



const TYPE_PUBLIC = 0;
const TYPE_PRIVATE = 1;

/**
 * Constructor for a Game object.
 * @constructor
 */
function Game(id, type) {
    debug('New game created');
    this.id = id;
    this.type = type;
    this.clients = new HashMap();
    this.players = new HashMap();
    this.treasuresStack = Stack.createTreasureStack(deck);
    this.doorsStack = Stack.createDoorStack(deck);

    this.treasuresStack.shuffle();
    this.doorsStack.shuffle();
}

/**
 * Factory method for a Game object.
 * @return {Game}
 */
Game.create = function(type) {
    return new Game(shortid.generate(), type);
};

Game.createPrivate = function() {
    return Game.create(TYPE_PRIVATE);
};

Game.createPublic = function() {
    return Game.create(TYPE_PUBLIC);
};

Game.prototype.isPrivate = function(){
    return this.type == TYPE_PRIVATE;
}

Game.prototype.addNewPlayer = function(socket, data) {
    debug('Add new player '+socket.id);
    this.clients.set(socket.id, socket);
    this.players.set(socket.id, Player.create(data.username));
  };

  Game.prototype.playerTakeDoorCard = function(id){
    debug("Player "+id+" take one door card");
    var card = this.doorsStack.take();
    var player = this.players.get(id);

    if( ! card){
        this.emitToAll('no-more-door-card');
        return;
    }

    player.addToHand(card);

    this.clients.get(id).emit('hand-card-list', player.getHand());
}

Game.prototype.emitToAll = function(event, data){
    this.clients.forEach(client => {
        client.emit(event, data);
    });
}

Game.prototype.playerOpenDoor = function(id){
    debug("Player "+id+" open the door");
    var player = this.players.get(id);

    var card = this.doorsStack.take();

    this.emitToAll('door-opened', card);
}

Game.prototype.playerTakeTreasureCard = function(id){
    debug("Player "+id+" take one treasure card");
    var card = this.treasuresStack.take();

    if( ! card){
        this.emitToAll('no-more-treasure-card');
        return;
    }

    var player = this.players.get(id);

    player.addToHand(card);

    this.clients.get(id).emit('hand-card-list', player.getHand());
}

Game.prototype.playerPlayCard = function(playerId, cardId){
    debug("Player "+playerId+" play card "+cardId);

    var player = this.players.get(playerId);

    player.playCard(cardId);
 
    this.clients.get(playerId).emit('hand-card-list', player.getHand());
    this.clients.get(playerId).emit('board-card-list', player.getBoard());
}

Game.prototype.removePlayer = function(id) {
    debug('Remove player '+id);
    this.clients.remove(id);
    this.players.remove(id);
}
/**
 * Returns a list containing the connected Player objects.
 * @return {Array<Player>}
 */
Game.prototype.getPlayers = function() {
    return this.players.values();
  };

module.exports = Game;