var socket = io.connect();

if( ! localStorage.getItem("username")){
    localStorage.setItem("username", "Anonyme");
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
    text+= '<img src="images/deck/'+card.img+'" class="rounded card '+(card.equiped?'':'card-not-equiped')+'" title="'+card.name+'"/>';
    return text;
}


socket.on('connect', function() {

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

socket.on('game-joined', function(data){
    currentPlayerId = data.playerId;
    accessToken = data.access_token;
    localStorage.setItem("playerId", currentPlayerId);


    let video = document.querySelector('video');
    if(video){
        eyeson.default.onEvent(event => {
            if (event.type !== 'accept') {
                return;
            }
            video.srcObject = event.remoteStream;
            video.play();
        });
        eyeson.default.start(accessToken);

        window.addEventListener("beforeunload", function (event) {
            eyeson.default.destroy();
        });
    }


});

socket.on('no-more-treasure-card', function(){
    $("#take-treasure-card").text("Aucune carte trésor").prop('disabled', true);
});

socket.on('no-more-door-card', function(){
    $("#take-door-card").text("Aucune carte donjon").prop('disabled', true);
});

socket.on('door-opened', function(card){
    $("#door-card").html(displayCard(card));
});

socket.on('door-taken', function(){
    $("#door-card").html("");
});

socket.on('log', function(logs){
    $("#logs").empty();
    logs.forEach(function(log){
        $("#logs").prepend("<li>" + log + "</li>");
    });
})

// Update dice value
socket.on('dice-rolled', function(value) {
    $("#roll-dice").text("Lancer un dé : " + value);
});
// Update dice value
socket.on('dice-rolling', function(value) {
    $("#roll-dice").text("Lancement d'un dé...");
});

// Update hand card list
socket.on('hand-card-list', function(cards) {
    $("#hand").empty();
    $('#hand-empty').toggle(cards.length == 0);
    cards.forEach(function(card, index){
        $("#hand").append("<li class='list-inline-item card-item'>" + displayCard(card) + " <div class='btn-group' role='group'><button class='btn btn-primary btn-xs play-card' data-card-id='"+index+"'>poser</button> <div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>donner</button><ul class='dropdown-menu give-hand-card' data-card-id='"+index+"' role='menu'></ul></div><button class='btn btn-danger btn-xs discard-hand-card' data-card-id='"+index+"'>défausser</button></div></li>");
    });
});


// Update board card list
socket.on('board-card-list', function(cards) {
    $("#board").empty();
    $('#board-empty').toggle(cards.length == 0);
    cards.forEach(function(card, index){
        $("#board").append("<li class='list-inline-item card-item'>" + displayCard(card) + " <div class='btn-group' role='group'><button class='btn btn-primary btn-xs "+(card.equiped?"unequip":"equip")+"-board-card' data-card-id='"+index+"'>"+(card.equiped?"déséquiper":"équiper")+"</button><div class='btn-group'><button class='btn btn-xs btn-primary dropdown-toggle' type='button' data-toggle='dropdown'>donner</button><ul class='dropdown-menu give-board-card' data-card-id='"+index+"' role='menu'></ul></div><button class='btn btn-danger btn-xs discard-board-card' data-card-id='"+index+"'>défausser</button></div></li>");
    });
});

// Update player list
socket.on('player-list', function(datas) {
    $("#players").empty();
    $("#players-boards").empty();
    $(".give-hand-card").empty();
    $(".give-board-card").empty();

    players = datas;
    players.forEach(player => {
        
        var playerLi = $("<li data-player-id='"+player.id+"'></li>").append("<span class='name'>"+player.name + " "+ (player.id == currentPlayerId ? "(vous) ":"")+"</span> " + (player.socketId==null?'<span class="badge badge-secondary">offline</span>':""));

        var infosUL = $('<ul class="list-inline infos"></ul>');
        infosUL.append("<li class='list-inline-item'>Niveau: <button class='btn btn-xs btn-primary decrease-level' type='button'>-</button> "+player.level+" <button class='btn btn-xs btn-primary increase-level' type='button'>+</button></li>");
        infosUL.append("<li class='list-inline-item'>Equipement: <button class='btn btn-xs btn-primary decrease-gear' type='button'>-</button> "+player.gear+" <button class='btn btn-xs btn-primary increase-gear' type='button'>+</button></li>");
        infosUL.append("<li class='list-inline-item'><strong>Force : "+(player.level+player.gear)+"</strong></li>");
        infosUL.append("<li class='list-inline-item'>Main: "+player.hand.length+" cartes</li>");
        playerLi.append(infosUL);

        if(player.id != currentPlayerId){

            $(".give-hand-card").append("<li><a href='#' data-player-id='"+player.id+"'>" + player.name + "</a></li>");
            $(".give-board-card").append("<li><a href='#' data-player-id='"+player.id+"'>" + player.name + "</a></li>");

            var playerBoard = $("<div class='boardzone'></div>").append("<h6>"+player.name +" (Niveau "+player.level +") <small>Son équipement</small></h6> " + (player.socketId==null?'<span class="badge badge-secondary">offline</span>':""));

            var cardUl = $('<ul class="list-inline"></ul>');
            player.board.forEach(card => {
                cardUl.append("<li class='list-inline-item'>" + displayCard(card) + "</li>");
            });
            playerBoard.append(cardUl);

            $("#players-boards").append(playerBoard);
        }

        $("#players").append(playerLi);
    });
});

function displayPlayerList(game){
    return game.players.join(', ');
}

// Update game list
socket.on('game-list', function(games) {
    var tbody = $("#games table tbody");
    tbody.empty();
    games.forEach(game => {
        tbody.append("<tr><td><a href='/" + game.uid + "'>" + game.name + "</a></td><td>" + displayPlayerList(game) + "</td><td>Aucune</td><td><a class='btn btn-primary btn-xs' href='/" + game.uid + "'>Rejoidre</a></td></tr>");
    });
});

$(function () {
    $("#create-public-game").on("click", () => {

        var data = {
            name: $("#game-name").val() || 'Unnamed game',
            addon: {
                "munchkin-addon-2" : $("#munchkin-addon-2").is(':checked'),
                "munchkin-addon-3" : $("#munchkin-addon-3").is(':checked'),
                "munchkin-addon-4" : $("#munchkin-addon-4").is(':checked'),
                "munchkin-addon-5" : $("#munchkin-addon-5").is(':checked')
            }
        };
        
        socket.emit('new-public-game', data);
    });
    $("#new-private-game").on("click", () => {

        var data = {
            name: 'Private game',
            addon: {
                "munchkin-addon-2" : false,
                "munchkin-addon-3" : false,
                "munchkin-addon-4" : false,
                "munchkin-addon-5" : false
            }
        };
        
        socket.emit('new-private-game', data);
    });

    $("#open-door").on("click", () => {
        socket.emit('open-door', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
        });
    });
    $("#take-open-door").on("click", () => {
        socket.emit('take-open-door', {
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
            'givenPlayerId' : $(this).parent().parent().parent().data('player-id')
        });
    })
    $(document).on('click', '.increase-level', function(){
        socket.emit('increase-level', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'givenPlayerId' : $(this).parent().parent().parent().data('player-id')
        });
    })

    $(document).on('click', '.decrease-gear', function(){
        socket.emit('decrease-gear', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'givenPlayerId' : $(this).parent().parent().parent().data('player-id')
        });
    })
    $(document).on('click', '.increase-gear', function(){
        socket.emit('increase-gear', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'givenPlayerId' : $(this).parent().parent().parent().data('player-id')
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

    $(document ).on("click", '.equip-board-card', function(){
        socket.emit('equip-board-card', {
            'gameId' : gameId,
            'playerId' : currentPlayerId,
            'cardId' : $(this).data('card-id')
        });
    });

    $(document ).on("click", '.unequip-board-card', function(){
        socket.emit('unequip-board-card', {
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

    $(document ).on("click", '.give-board-card a', function(){
        socket.emit('give-board-card', {
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