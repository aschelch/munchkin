const shortid = require('shortid');

function Player(id, socketId, name){
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.level = 1;
    this.hand = [];
    this.board = [];
}

/**
 * Factory method for a Player object.
 * @return {Player}
 */
Player.create = function(socketId, name) {
    return new Player(shortid.generate(), socketId, name);
};

Player.prototype.addToHand = function(card){
    this.hand.push(card);
}

Player.prototype.getHand = function(){
    return this.hand;
}

Player.prototype.setLevel = function(level){
    this.level = level;
}

Player.prototype.getLevel = function(){
    return this.level;
}

Player.prototype.getBoard = function(){
    return this.board;
}

Player.prototype.addToBoard = function(card){
    this.board.push(card);
}

/**
 * Play a card from player's hand to player's board
 */
Player.prototype.playCard = function(cardIndex){
    var card = this.hand[cardIndex];
    this.hand.splice(cardIndex, 1);
    this.board.push(card);
    return card;
}

/**
 * Discard a card from player's hand
 */
Player.prototype.discardHandCard = function(cardIndex){
    var card = this.hand[cardIndex];
    this.hand.splice(cardIndex, 1);
    return card;
}

/**
 * Discard a card from player's board
 */
Player.prototype.discardBoardCard = function(cardIndex){
    var card = this.board[cardIndex];
    this.board.splice(cardIndex, 1);
    return card;
}

module.exports = Player;