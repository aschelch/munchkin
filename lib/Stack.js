const Card = require('./Card')
const debug = require('debug')('munchkin:stack');
const shuffle = require('shuffle-array');

function Stack(){
    this.cards = [];
}

Stack.create = function (cardCategory, deck){
    var stack = new Stack();
    
    if(deck){
        deck.forEach(deckItem => {
            stack.add(Card.create(cardCategory, deckItem));
        });
    }

    return stack;
}

Stack.createTreasureStack = function(deck) {
    return Stack.create(Card.CATEGORY_TREASURE, deck.treasures);
};

Stack.createDoorStack = function(deck) {
    return Stack.create(Card.CATEGORY_DOOR, deck.doors);
};

Stack.prototype.isEmpty = function(){
    return this.cards.length == 0;
}

Stack.prototype.shuffle = function(){
    debug('Shuffle '+this.cards.length+' cards')
    shuffle(this.cards);
}

Stack.prototype.add = function(card){
    this.cards.push(card);
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