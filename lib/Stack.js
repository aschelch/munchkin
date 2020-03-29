const Card = require('./Card')
const debug = require('debug')('munchkin:stack');
const shuffle = require('shuffle-array');

function Stack(deck){
    this.cards = [];

    deck.forEach(deckItem => {
        this.cards.push(Card.create(deckItem));
    });

}

Stack.createTreasureStack = function(deck) {
    return new Stack(deck.treasures);
};

Stack.createDoorStack = function(deck) {
    return new Stack(deck.doors);
};

Stack.prototype.shuffle = function(){
    debug('Shuffle a card')
    shuffle(this.cards);
}

Stack.prototype.take = function(){
    if(this.cards.length == 0){
        debug('Stack empty.');
        return;
    }

    debug('Take a card ('+this.cards.length+' in stack)')
    return this.cards.pop();
}

module.exports = Stack;