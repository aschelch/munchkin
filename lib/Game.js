const HashMap = require('hashmap');
const Player = require('./Player');
const Stack = require('./Stack');
const Card = require('./Card');
const debug = require('debug')('munchkin:game');
const shortid = require('shortid');
const Utils = require('./Utils');


const deck = require('./data/munchkin.json');

const TYPE_PUBLIC = 0;
const TYPE_PRIVATE = 1;

/**
 * Constructor for a Game object.
 * @constructor
 */
function Game(id, type, name) {
    debug('New game created');

    this.id = id;
    this.type = type;
    this.name = name;
    this.sockets = new HashMap();
    this.players = new HashMap();
    this.logs = [];

    this.treasuresStack = Stack.createTreasureStack(deck);
    this.doorsStack = Stack.createDoorStack(deck);

    this.treasuresDiscardStack = Stack.create();
    this.doorsDiscardStack = Stack.create();

    this.treasuresStack.shuffle();
    this.doorsStack.shuffle();
}

/**
 * Factory method for a Game object.
 * @return {Game}
 */
Game.create = function(type, name) {
    return new Game(shortid.generate(), type, name);
};

Game.createPrivate = function(data) {
    return Game.create(TYPE_PRIVATE, data.name);
};

Game.createPublic = function(data) {
    return Game.create(TYPE_PUBLIC, data.name);
};

Game.prototype.isPrivate = function(){
    return this.type == TYPE_PRIVATE;
}

Game.prototype.addPlayer = function(socket, data) {

    var player = this.players.get(data.playerId);

    if( ! player){
        debug('Add new player '+socket.id);
        player = Player.create(socket.id, data.username);
    }

    player.socketId = socket.id;
    player.username = data.username;

    this.sockets.set(player.id, socket);
    this.players.set(player.id, player);

    this.log(data.username + " a rejoint la partie");

    this.emitToAll('player-list', this.getPlayers());

    socket.emit('hand-card-list', player.getHand());
    socket.emit('board-card-list', player.getBoard());

    return player.id;
};

Game.prototype.playerTakeDoorCard = function(playerId){
    debug("Player "+playerId+" take one door card");
    var card = this.doorsStack.take();

    if( ! card){
        this.emitToAll('no-more-door-card');
        return;
    }

    // If stack is empty, we shuffle discard stack and use it.
    if(this.doorsStack.isEmpty() && ! this.doorsDiscardStack.isEmpty()){
        debug("Door card stack is empty, we take and shuffle discard stack");
        this.doorsDiscardStack.shuffle();
        this.doorsStack = this.doorsDiscardStack;
        this.doorsDiscardStack = Stack.create();
    }

    var player = this.players.get(playerId);
    player.addToHand(card);

    this.log("<strong>"+player.username + "</strong> a pioché une carte Donjon");

    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
}

Game.prototype.discard = function(card){

    if(card.category == Card.CATEGORY_DOOR){    
        this.doorsDiscardStack.add(card);
    }else{
        this.treasuresDiscardStack.add(card);
    }

}

Game.prototype.playerOpenDoor = function(playerId){
    debug("Player "+playerId+" open the door");

    if(this.doorCard){
        this.discard(this.doorCard);
    }
    
    //var player = this.players.get(playerId);
    this.doorCard = this.doorsStack.take();

    if(this.doorCard){
        this.emitToAll('door-opened', this.doorCard);
    }

    var player = this.players.get(playerId);
    this.log("<strong>"+player.username + "</strong> a ouvert la porte");
}


Game.prototype.playerTakeOpenDoor = function(playerId){
    debug("Player "+playerId+" take the door");
    
    if( ! this.doorCard){
        return;
    }

    var player = this.players.get(playerId);
    player.addToHand(this.doorCard);
    this.log("<strong>"+player.username + "</strong> a pris la carte <strong>"+this.doorCard.name+"</strong>");
    this.doorCard = null;
    this.emitToAll('door-taken');

    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
}

Game.prototype.playerTakeTreasureCard = function(playerId){
    debug("Player "+playerId+" take one treasure card");
    
    var card = this.treasuresStack.take();
    if( ! card){
        this.emitToAll('no-more-treasure-card');
        return;
    }

    // If stack is empty, we shuffle discard stack and use it.
    if(this.treasuresStack.isEmpty() && ! this.treasuresDiscardStack.isEmpty()){
        debug("Treasure card stack is empty, we take and shuffle discard stack");
        this.treasuresDiscardStack.shuffle();
        this.treasuresStack = this.treasuresDiscardStack;
        this.treasuresDiscardStack = Stack.create();
    }

    var player = this.players.get(playerId);
    player.addToHand(card);


    var player = this.players.get(playerId);
    this.log("<strong>"+player.username + "</strong> a pioché une carte trésor");

    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
}

Game.prototype.playerPlayCard = function(playerId, cardId){
    debug("Player "+playerId+" play card "+cardId);

    var player = this.players.get(playerId);

    var card = player.playCard(cardId);
 
    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
    this.sockets.get(playerId).emit('board-card-list', player.getBoard());

    this.log("<strong>"+player.username + "</strong> a posé <strong>" + card.name + "</strong>");
}

Game.prototype.discardHandCard = function(playerId, cardId){
    debug("Player "+playerId+" discard hand card "+cardId);
    
    var player = this.players.get(playerId);
    var card = player.discardHandCard(cardId);

    if(card.category == Card.CATEGORY_DOOR){    
        this.doorsDiscardStack.add(card);
    }else{
        this.treasuresDiscardStack.add(card);
    }
    
    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
    this.log("<strong>"+player.username+"</strong> a défaussé <strong>"+card.name+"</strong>");
}

Game.prototype.discardBoardCard = function(playerId, cardId){
    debug("Player "+playerId+" discard board card "+cardId);
    
    var player = this.players.get(playerId);
    var card = player.discardBoardCard(cardId);

    if(card.category == Card.CATEGORY_DOOR){    
        this.doorsDiscardStack.add(card);
    }else{
        this.treasuresDiscardStack.add(card);
    }

    this.sockets.get(playerId).emit('board-card-list', player.getBoard());

    this.log("<strong>"+player.username+"</strong> a défaussé <strong>" + card.name + "</strong>");
}

Game.prototype.giveHandCard = function(playerId, cardId, givenPlayerId){
    debug("Player "+playerId+" give hand card "+cardId+" to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var card = player.discardHandCard(cardId);

    var givenPlayer = this.players.get(givenPlayerId);
    givenPlayer.addToHand(card);

    this.sockets.get(playerId).emit('hand-card-list', player.getHand());
    this.sockets.get(givenPlayerId).emit('hand-card-list', givenPlayer.getHand());

    this.log("<strong>"+player.username+"</strong> a donné une carte à <strong>" + givenPlayer.username + "</strong>");
}

Game.prototype.giveBoardCard = function(playerId, cardId, givenPlayerId){
    debug("Player "+playerId+" give board card "+cardId+" to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var card = player.discardBoardCard(cardId);

    var givenPlayer = this.players.get(givenPlayerId);
    givenPlayer.addToBoard(card);

    this.sockets.get(playerId).emit('board-card-list', player.getBoard());
    this.sockets.get(givenPlayerId).emit('board-card-list', givenPlayer.getBoard());

    this.log("<strong>"+player.username+"</strong> a donné <strong>"+card.name+"</strong> à <strong>" + givenPlayer.username + "</strong>");
}

Game.prototype.increasePlayerLevel = function(playerId, givenPlayerId){
    debug("Player "+playerId+" increase level to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var givenPlayer = this.players.get(givenPlayerId);
    var level = givenPlayer.getLevel() + 1;
    givenPlayer.setLevel(level);

    this.log("<strong>"+player.username+"</strong> a passé " + "<strong>"+giventPlayer.username + "</strong> niveau <strong>"+level+"</strong>");
}

Game.prototype.decreasePlayerLevel = function(playerId, givenPlayerId){
    debug("Player "+playerId+" decrease level to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var givenPlayer = this.players.get(givenPlayerId);
    var level = Math.max(1, givenPlayer.getLevel() - 1);
    givenPlayer.setLevel(level);

    this.log("<strong>"+player.username+"</strong> a passé " + "<strong>"+giventPlayer.username + "</strong> niveau <strong>"+level+"</strong>");
}

Game.prototype.increasePlayerGear = function(playerId, givenPlayerId){
    debug("Player "+playerId+" increase gear to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var givenPlayer = this.players.get(givenPlayerId);
    var gear = givenPlayer.getGear() + 1;
    givenPlayer.setGear(gear);

    this.log("<strong>"+player.username+"</strong> a augmenté l'équipement de " + "<strong>"+giventPlayer.username + "</strong> à <strong>"+gear+"</strong>");
}

Game.prototype.decreasePlayerGear = function(playerId, givenPlayerId){
    debug("Player "+playerId+" decrease gear to player "+givenPlayerId );
    
    var player = this.players.get(playerId);
    var givenPlayer = this.players.get(givenPlayerId);
    var gear = Math.max(0, givenPlayer.getGear() - 1);
    givenPlayer.setGear(gear);

    this.log("<strong>"+player.username+"</strong> a diminué l'équipement de " + "<strong>"+giventPlayer.username + "</strong> à <strong>"+gear+"</strong>");
}

Game.prototype.rollDice = function(playerId){
    debug("Player "+playerId+" roll a dice");
    var player = this.players.get(playerId);

    this.emitToAll('dice-rolling');

    var game = this;
    setTimeout(function(){

        var dice =  Utils.rollDice(1, 6);
        game.emitToAll('dice-rolled', dice);
        game.log("<strong>"+player.username+"</strong> a lancé au jet de dé : <strong>" + dice + "</strong>");
    }, 1000);
}

/**
 * Remove a player
 */
Game.prototype.removePlayer = function(playerId) {
    debug('Remove player '+playerId);
    this.sockets.remove(playerId);
    this.players.remove(playerId);
}


Game.prototype.disconnectPlayer = function(socketId){
    debug('Disconnect player from socket '+socketId);
    this.players.forEach(player => {
        if(player.socketId == socketId){
            player.socketId = null;
            this.sockets[player.id] = null;
            this.log("<strong>"+player.username + "</strong> a quiité la partie");
        }
    });
}

/**
 * Returns a list containing the connected Player objects.
 * @return {Array<Player>}
 */
Game.prototype.getPlayers = function() {
    return this.players.values();
};

Game.prototype.log = function(log){
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    this.logs.push(time + " " +  log);
    this.emitToAll('log', this.logs);
}


/**
 * Emit an event to all players of the game
 */
Game.prototype.emitToAll = function(event, data){
    this.sockets.forEach(client => {
        client.emit(event, data);
    });
}

module.exports = Game;