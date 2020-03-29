
function Player(name){
    this.name = name;
    this.level = 1;
    this.hand = [];
    this.board = [];
}

/**
 * Factory method for a Player object.
 * @return {Player}
 */
Player.create = function(name) {
    return new Player(name);
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

Player.prototype.playCard = function(cardId){
    var card = this.hand[cardId];
    this.hand.splice(cardId, 1);
    this.board.push(card);
}

module.exports = Player;