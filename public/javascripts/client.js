var socket = io.connect('http://localhost:3000');

if( ! localStorage.getItem("username")){
    localStorage.setItem("username", "Anonymous");
}

var gameId = null;
if(window.location.pathname != '/'){
    var pathArray = window.location.pathname.split('/');
    gameId = pathArray[1];
}

var players = [];
var currentPlayerId = localStorage.getItem("playerId");


function displayCard(card){
    var text = "";

    text+= "<img src='images/deck/"+card.img+"' class='rounded card' style='width:100px;' title='"+card.name+"'/>";
/*
    switch (card.type) {
        case "monster":
            text += " (level: "+card.level+(card.successLevel?", "+card.successLevel+" level":"")+(card.successTreasures?", "+card.successTreasures+" treasures":"")+")";
            break;
        case "curse":
            break;
        case "item":
            text += " ("+(card.bonus?"bonus: "+card.bonus+", ":"")+"price: "+card.price+"po)";
        default:
            break;
    }
*/
    return text;
}


socket.on('connect', function() {
    console.log('Connected to server');

    if(gameId){
        socket.emit('join-game', {
            'gameId' : gameId,
            'username' : localStorage.getItem("username"),
            'playerId' : currentPlayerId,
        });
    }
    
});

socket.on('game-created', function(gameId){
    window.location.href = '/' + gameId;
});

socket.on('game-joined', function(playerId){
    currentPlayerId = playerId;
    localStorage.setItem("playerId", playerId);
});

socket.on('no-more-treasure-card', function(){
    $("#take-treasure-card").text("No more treasure card").prop('disabled', true);
});

socket.on('no-more-door-card', function(){
    $("#take-door-card").text("No more door card").prop('disabled', true);
});

socket.on('door-opened', function(card){
    $("#door-card").html("Behind the door : " + displayCard(card));
});

// Update dice value
socket.on('dice-rolled', function(value) {
    $("#roll-dice").text("Roll a dice : " + value);
});
// Update dice value
socket.on('dice-rolling', function(value) {
    $("#roll-dice").text("Rolling a dice...");
});

// Update hand card list
socket.on('hand-card-list', function(cards) {
    $("#hand").empty();
    cards.forEach(function(card, index){
        console.log(card);
        $("#hand").append("<li class='list-inline-item card-item'>" + displayCard(card) + " <div class='btn-group' role='group'><button class='btn btn-primary btn-xs play-card' data-card-id='"+index+"'>play</button> <div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>give</button><ul class='dropdown-menu give-hand-card' data-card-id='"+index+"' role='menu'></ul></div><button class='btn btn-danger btn-xs discard-hand-card' data-card-id='"+index+"'>discard</button></div></li>");
    });
});


// Update board card list
socket.on('board-card-list', function(cards) {
    $("#board").empty();
    cards.forEach(function(card, index){
        $("#board").append("<li class='list-inline-item card-item'>" + displayCard(card) + " <div class='btn-group' role='group'><div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>give</button><ul class='dropdown-menu give-board-card' data-card-id='"+index+"' role='menu'></ul></div><button class='btn btn-danger btn-xs discard-board-card' data-card-id='"+index+"'>discard</button></div></li>");
    });
});

// Update player list
socket.on('player-list', function(datas) {
    $("#players").empty();
    $(".give-hand-card").empty();
    $(".give-board-card").empty();

    players = datas;
    players.forEach(player => {
        
        var playerLi = $("<li data-player-id='"+player.id+"'></li>").append(player.name + " "+ (player.id == currentPlayerId ? "(vous) ":"") + (player.socketId==null?'<span class="badge badge-secondary">offline</span>':"")+", level: <button class='btn btn-xs btn-primary decrease-level' type='button'>-</button> "+player.level+" <button class='btn btn-xs btn-primary increase-level' type='button'>+</button>, hand: "+player.hand.length+" cards");
        playerLi.append("")

        if(player.id != currentPlayerId){

            $(".give-hand-card").append("<li><a href='#' data-player-id='"+player.id+"'>" + player.name + "</a></li>");
            $(".give-board-card").append("<li><a href='#' data-player-id='"+player.id+"'>" + player.name + "</a></li>");
            var cardUl = $('<ul class="list-inline"></ul>');
            player.board.forEach(card => {
                cardUl.append("<li class='list-inline-item'>" + displayCard(card) + "</li>");
            });
            playerLi.append(cardUl);
        }

        $("#players").append(playerLi);
    });
});

// Update game list
socket.on('game-list', function(games) {
    $("#games").empty();
    games.forEach(game => {
        $("#games").append("<li><a href='/" + game.uid + "'>" + game.uid + "</a>, " + game.nbPlayers + " players</li>");
    });
});

$(function () {
    $("#new-public-game").on("click", () => {
        socket.emit('new-public-game', );
    });
    $("#new-private-game").on("click", () => {
        socket.emit('new-private-game');
    });

    $("#open-door").on("click", () => {
        socket.emit('open-door', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
        });
    });
    $("#take-door-card").on("click", () => {
        socket.emit('take-door-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
        });
    });
    $("#take-treasure-card").on("click", () => {
        socket.emit('take-treasure-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
        });
    });
    $("#roll-dice").on("click", () => {
        $("#roll-dice").text("Rolling a dice...");
        socket.emit('roll-dice', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
        });
    });

    $(document ).on("click", '.play-card', function(){
        socket.emit('play-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'cardId' : $(this).data('card-id')
        });
    });

    $(document).on('click', '.decrease-level', function(){
        socket.emit('decrease-level', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'givenPlayerId' : $(this).parent().data('player-id')
        });
    })
    $(document).on('click', '.increase-level', function(){
        socket.emit('increase-level', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'givenPlayerId' : $(this).parent().data('player-id')
        });
    })

    $(document ).on("click", '.discard-hand-card', function(){
        socket.emit('discard-hand-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'cardId' : $(this).data('card-id')
        });
    });

    $(document ).on("click", '.discard-board-card', function(){
        socket.emit('discard-board-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'cardId' : $(this).data('card-id')
        });
    });

    $(document ).on("click", '.give-hand-card a', function(){
        socket.emit('give-hand-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'cardId' : $(this).parent().parent().data('card-id'),
            'givenPlayerId' : $(this).data('player-id')
        });
    });

    $("#username").val(localStorage.getItem("username"));
    $("#username").on('change', function(){
        localStorage.setItem("username", $(this).val());
    });
});