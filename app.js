var http = require('http'),
express = require("express"),
app = express(),
fs   = require('fs'),
Game = require('./server.js').game;
Player = require('./server.js').player;
Team = require('./server.js').team;

//setUp game
var game = new Game();

game.spawnNotesAndTrees();

var blueTeam = new Team(game, 'blue', {x:1300, y:1500});

var redteam = new Team(game, "red", {x:3400, y:2300});

var greenTeam = new Team(game, "green", {x:1300, y:3400});

//setUp Routes
app.use(express.static(__dirname + '/public'));

var index = fs.readFileSync('index.html');

app.get('/player/:name', function (req, res){

   res.writeHead(200, {'Content-Type': 'text/html'});

   var pName = req.params.name;
   
   if(!game.hasPlayer(pName)) game.addPlayer(pName, pName == "master" ? true : false);
   else res.write(pName);

   res.write(index);

   res.end();

});

//setUp sockets
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {

	if(game.started == true){
		
    	socket.emit('startgame_client', game);
	  
	}

	socket.on('startgame_server', function(data){
		 
		game.startsecond = new Date().getTime() / 1000;

		game.state = "started";	
		
		process.nextTick(function(){ game.update(io) } );
	  
 	});

	socket.on('stealWood', function(data){
		  
		var woodTotal = 250;

  		if(data.team.name == "red"){
			
			if(game.teams["red"].score >= 250){
			
  				game.teams["red"].score -= 250;
				
			
			}else{
				
				woodTotal = game.teams["red"].score;
				
				game.teams["red"].score = 0;
				
				
			}
			
  		}
  		if(data.team.name == "blue"){
			
			if(game.teams["blue"].score >= 250){
			
  				game.teams["blue"].score -= 250;
							
			}else{
				
				woodTotal = game.teams["blue"].score;
				
				game.teams["blue"].score = 0;
				
				
			}
			
  		}
  		if(data.team.name == "green"){
			
			if(game.teams["green"].score >= 250){
			
  				game.teams["green"].score-= 250;
							
			}else{
				
				woodTotal = game.teams["green"].scoren;
				
				game.teams["green"].score = 0;
				
				
			}
			
  		}
				 		 
		socket.emit('stealTotal', {total: woodTotal})
		
	});
	
	socket.on("sendChat", function(data){

		var player = game.findPlayerByName(data.player.name);
	 
	 	player.chatText = data.message;
	 	player.chatting = true;
		
		setTimeout(function() { 
		 	player.chatting = false;	
		 }, 5000);

	});
		
    socket.on('arm', function(data){

    	var player = game.findPlayerByName(data.player.name);
	
		player.attacking = data.armed;
	
	});
	    
	socket.on('slash', function(data){

		var player = game.findPlayerByName(data.player.name);
	
		player.slashing = data.slashed;
	
	});
	
    socket.on('getNote', function(data){
		
	 	game.notes[data.number].removed = true;
		
        io.sockets.emit('noteGot', {number: data.number});
	
	});
	
    socket.on('depLog', function(data){
				
		game.teams[data.team] += data.amount;
		
        io.sockets.emit('logged', {score: score});
	
	});
	
	
    socket.on('chopTree', function(data){
		
	 	game.trees[data.number].removed = true;
		
        io.sockets.emit('treeChopped', {number: data.number});
	
	});
	
   socket.on('move_input', function(data){

   	var dummy = {};
	var player = game.findPlayerByName(data.player.name);
	
	dummy.x = player.x;
	dummy.y = player.y;
	   	   
	if(data.direction == "up"){
	   
	   dummy.y = player.y - data.amount;
	   
	   player.direction = "U";

	}
	if(data.direction == "down"){

	   dummy.y = player.y + data.amount;
	   player.direction = "D";

	}
	if(data.direction == "left"){

	   dummy.x = player.x - data.amount;
	   player.direction = "L";

	}
	if(data.direction == "right"){

	   dummy.x = player.x + data.amount;
	   player.direction = "R";

	}

	player.checkCollisions(dummy);
	player.checkHits();
 
  });

/*
  
	socket.on('changeteam', function(data){
		
		if (player.canDisguise == true){// has ability

		//players[data.number].canDisguise = data.canDisguise;
		players[data.number].renderteam = data.team;

	});

	socket.on('givechangeteam', function(data){
		
		players[data.number].canDisguise = data.canDisguise;
		
	});

	socket.on('givesword', function(data){
		
		players[data.number].swordBearer = data.swordBearer;

	});

	socket.on('makechosen', function(data){
		
		players[data.number].chosenOne = data.chosenOne;

	});

	socket.on('makepapa', function(data){
		
		players[data.number].swordBearer = false;
		
		players[data.number].PAPABEAR = data.PAPABEAR;
		
		players[data.number].x = notes[data.noteNumb].x + 2;
		
		players[data.number].y = notes[data.noteNumb].y+ 2;
		
	});

*/
  
});


