var socket = io.connect('http://localhost:3000');

if( ! localStorage.getItem("username")){
    localStorage.setItem("username", "Anonymous");
}

var gameId = null;
if(window.location.pathname != '/'){
    var pathArray = window.location.pathname.split('/');
    gameId = pathArray[1];
}


socket.on('connect', function() {
    console.log('Connected to server');

    if(gameId){
        socket.emit('join-game', {
            'gameId' : gameId,
            'username' : localStorage.getItem("username")
        });
    }
    
});

socket.on('no-more-treasure-card', function(){
    $("#take-treasure-card").text("No more treasure card").prop('disabled', true);
});

socket.on('no-more-door-card', function(){
    $("#take-door-card").text("No more door card").prop('disabled', true);
});

socket.on('door-opened', function(card){
    $("#door-card").text("Behind the door : " + card.name + " (" + card.type + ")");
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
        $("#hand").append("<li>" + card.name + " (" + card.type + "), <div class='btn-group' role='group'><button class='btn btn-primary btn-xs play-card' data-card-id='"+index+"'>play</button> <div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>give</button><ul class='dropdown-menu' role='menu'><li><a href='#'>Player A</a></li><li><a href='#'>Player B</a></li></ul></div><button class='btn btn-danger btn-xs'>dump</button></div></li>");
    });

});


// Update board card list
socket.on('board-card-list', function(cards) {
    $("#board").empty();
    cards.forEach(function(card, index){
        $("#board").append("<li>" + card.name + " (" + card.type + "), <div class='btn-group' role='group'><div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>give</button><ul class='dropdown-menu' role='menu'><li><a href='#'>Player A</a></li><li><a href='#'>Player B</a></li></ul></div><button class='btn btn-danger btn-xs'>dump</button></div></li>");
    });
});

// Update player list
socket.on('player-list', function(players) {
    $("#players").empty();
    players.forEach(player => {
        $("#players").append("<li>" + player.name + ", level: "+player.level+", hand: "+player.hand.length+" cards</li>");
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
        });
    });
    $("#take-door-card").on("click", () => {
        socket.emit('take-door-card', {
            'gameId' : gameId,
        });
    });
    $("#take-treasure-card").on("click", () => {
        socket.emit('take-treasure-card', {
            'gameId' : gameId,
        });
    });
    $("#roll-dice").on("click", () => {
        $("#roll-dice").text("Rolling a dice...");
        socket.emit('roll-dice', {
            'gameId' : gameId
        });
    });

    $( document ).on( "click", '.play-card', function(){
        socket.emit('play-card', {
            'gameId' : gameId,
            'cardId' : $(this).data('card-id')
        });
    });


    $("#username").val(localStorage.getItem("username"));
    $("#username").on('change', function(){
        localStorage.setItem("username", $(this).val());
    });
});