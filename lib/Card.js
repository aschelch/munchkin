const debug = require('debug')('munchkin:card');

Card.CATEGORY_DOOR = "door";
Card.CATEGORY_TREASURE = "treasure";

Card.TYPE_MONSTER = "monster";
Card.TYPE_CURSE = "curse";
Card.TYPE_ITEM = "item";

function Card(category, type, name){
    this.category = category;
    this.type = type;
    this.name = name;
    this.img = "";
    this.bonus = 0;
    this.level = 0;
    this.price = 0;
    this.successTreasures = 0;
    this.successLevel = 0;
}

/**
 * Factory method for a Card object.
 * @return {Card}
 */
Card.create = function(category, item) {
    var card = new Card(category, item.type, item.name);
    if(item.level){
        card.level = item.level;
    }
    if(item.img){
        card.img = item.img;
    }
    if(item.price){
        card.price = item.price;
    }
    if(item.bonus){
        card.bonus = item.bonus;
    }
    if(item.successTreasures){
        card.successTreasures = item.successTreasures;
    }
    if(item.successLevel){
        card.successLevel = item.successLevel;
    }
    return card;
};

/**
 * Factory method for a Door Card object.
 * @return {Card}
 */
Card.createDoor = function(item) {
    debug("Create door card "+item);
    return Card.create(Card.CATEGORY_DOOR , item);
};

/**
 * Factory method for a Door Card object.
 * @return {Card}
 */
Card.createTreasure = function(item) {
    debug("Create door card "+item);
    return Card.create(Card.CATEGORY_TREASURE , item);
};

Card.prototype.setBonus = function(bonus){
    this.bonus = bonus;
}

module.exports = Card;