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

   res.writeHead(200, {'content-type': 'text/html'});

   var pName = req.params.name;

   if(!game.hasPlayer(pName)) game.addPlayer(pName, pName == "master" ? true : false);
   else res.write(JSON.parse({returning: pName}));

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

		 game.started = true;	  	  	  
	  
 	});

	socket.on('player_killed', function(player){

		player = game.findPlayerByName(player.name);

		player.dead = true;	

		player.spawn(function(spawn){

			setTimeout(function() { 
				player.x = spawn.x;
				player.y = spawn.y;
				player.dead = false;
				player.PAPABEAR = false;
				
			 }, 8000);

		});

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
	   
		check[data.number].x = players[data.number].x;
		check[data.number].y = players[data.number].y;
	   
	   illegal[data.number] = false;
	   
	   if(data.direction == "up"){
		   
		   check[data.number].y = players[data.number].y - data.amount;
		   
		   players[data.number].direction = "U";

	   }
	   if(data.direction == "down"){
	   	
		   check[data.number].y = players[data.number].y + data.amount;
		   players[data.number].direction = "D";
		
	   }
	   if(data.direction == "left"){
	   	
		   check[data.number].x = players[data.number].x - data.amount;
		   players[data.number].direction = "L";
		
	   }
	   if(data.direction == "right"){
	   	
		   check[data.number].x = players[data.number].x + data.amount;
		   players[data.number].direction = "R";

	   }
   	
	illegal[data.number] = false;
	
	if(!players[data.number].PAPABEAR){
	
	   	for(i = 0; i < players.length; i++){
				
	   		if(i != data.number && !players[i].dead){
		
   				if(!players[i].PAPABEAR && checkCollision(check[data.number], players[i], 41, 36, 41, 36, 0, 0)){
			
   					illegal[data.number] = true;
					
   				}
					
	   		}
		
	   	}
	
	}
		
   	for(i = 0; i < trees.length; i++){
		
		if(trees[i].removed == false){
		
			if(players[data.number].PAPABEAR){
			
				if(checkCollision(check[data.number], trees[i], 63, 63, 78, 78, 0, 0)){
		
					illegal[data.number] = true;
			
				}
		
			}else{
			
				if(checkCollision(check[data.number], trees[i], 41, 36, 78, 78, 0, 0)){
		
					illegal[data.number] = true;
			
				}
			}
		
		}
		
   	}
	
   	if(!illegal[data.number]){
		
		players[data.number].x = check[data.number].x;
		players[data.number].y = check[data.number].y;
		
   	}
	 
  });

/*
  
	socket.on('changeteam', function(data){
		
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

function updateClients() {
	
	if(game.started == true){
		
		currentseconds = new Date().getTime() / 1000;
		elapsedseconds = Math.floor(currentseconds - startsecond);

		io.sockets.emit('update_clients', {game: game, time: elapsedseconds});
   
	}

}

// updates clients every 
setInterval(updateClients, 0);