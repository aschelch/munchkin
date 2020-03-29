const debug = require('debug')('munchkin:card');

function Card(type, name){
    this.type = type;
    this.name = name;
}

/**
 * Factory method for a Card object.
 * @return {Card}
 */
Card.create = function(item) {
    debug("Create card "+item);
    return new Card(item.type, item.name);
};

module.exports = Card;