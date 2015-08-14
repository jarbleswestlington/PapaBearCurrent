var http = require('http'),
q = require('q'),
express = require("express"),
app = express(),
util = require('util')
fs   = require('fs'),
game = require('./server.js');

app.use(express.static(__dirname + '/public'));

var index = fs.readFileSync('index.html');

app.get('/', function (req, res){

   res.writeHead(200, {'content-type': 'text/html'});

   res.write(index);

   res.end();

});

var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server);


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function checkCollision(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;

       }

   }
}


var Game = function(){

	this.teams = {},
	this.check = [],
	this.illegal = [],
	
	this.master = undefined,
	
	this.treeNum = 1,
	this.joined = 0,
	this.playerCount = 0,
	
	this.started = false,

	this.trees = [],
	this.notes = [],
	this.currentTeamMax = 1,
};

Game.prototype.spawnNotesAndTrees = function(){
	
	for(var i = 0; i < 60; i++){
		
		for(var j = 0; j < 60; j++){
			
			if((j < 15 || i < 15) || (j > 45 || i > 45)){

				var chance = Math.random() * 100;
			
				if(chance <= 65){
				
					this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
				
				
				}
				if(chance > 65 && chance <= 68){
				
					this.notes.push({x: i * 78, y: j * 78, removed: false});
				
				
				}
				if(chance > 68){
				
				
				}
			
			}
			if(j > 14 && i > 14 && j < 46 && i < 46){

				if(j > 14 && i > 19 && j < 24 && i < 46){

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}else if (j > 23 && i > 14 && j < 38 && i < 41) {

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}else if (j > 37 && i > 19 && j < 46 && i < 46) {

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}
		
			}	
		}
	}
	
}

var Player = function(args){
	
	this.x = 0,
	this.y = 0,
	this.team = args.team,
	this.renderteam = args.team,
	this.name = args.name,
	this.direction = "D",
	
	this.attacking = false,
	this.slashing = false,
	this.character = Math.floor((Math.random() * 3) + 1),
	
	this.canDisguise = false,
	this.swordBearer = false,
	this.chosenOne = false,
	this.PAPABEAR = false,
	
	this.dead = false,
	
	this.chatting = false,
	this.chatText =  "",
	this.illegal = false,
};

Player.prototype.spawn = function(){
	
	var spawnX = 0;

	var spawnY = 0;

	if (this.team.name == "blue") {

		spawnX = 1300 + (100 * Math.random() * 4);

		spawnY = 1300 + (100 * Math.random() * 4);

	}else if (this.team.name == "red") {

		spawnX = 3400 - (100 * Math.random() * 4);

		spawnY = 2300 + (100 * Math.random() * 4);

	}else if (this.team.name == "green") {

		spawnX = 1300 + (100 * Math.random() * 4);

		spawnY = 3400 - (100 * Math.random() * 4); 

	}

	this.x = spawnX;
	this.y = spawnY;

}

Game.prototype.addPlayer = function(name, master){
	
	
	if(master){
		
		var joiningPlayer = {name: name, team: this};

		joiningPlayer.team = this;
		
		this.master = new Player(joiningPlayer);

	}else{ 
		
		var allMax = true;
		var aTeam = "";
		
		for(var tName in this.teams){
			
			var tLength = this.teams[tName].players.length;
			
			//check if all teams are at max
			if(tLength !== this.currentTeamMax) allMax = false;
			else aTeam = tName;
			
			if(tLength < this.currentTeamMax){
				
				this.teams[tName].addPlayer(name);
				
				break;
				
			}
		}
		
		//if all teams are at max
		if(allMax && aTeam != ""){
			
			this.currentTeamMax++;
			
			this.teams[aTeam].addPlayer(name);
		}

	}

}


var Team = function(game, name, coord){
	
	this.score = 0,
	this.name = name,
	this.players = [],
	this.baseX = coord.x,
	this.baseY = coord.y,

	game.teams[name] = this;
};

Team.prototype.addPlayer(name){
	
	var newPlayer = new Player({name: name, team: this});
	
	newPlayer.spawn();
	
	this.players.push(newPlayer);
}

var game = new Game();

var blueTeam = new Team(game, 'blue', {1300, 1500});

var redteam = new Team(game, "red", {3400, 2300});

var greenTeam = new Team(game, "green", {1300, 3400});

io.sockets.on('connection', function(socket) {
	
	  socket.on('stealWood', function(data){
		  
		 woodTotal = 250;
	  	
  		if(data.team == "yellow"){
			
			if(score.yellow >= 250){
				
	  			score.yellow -= 250;
				
			}else{
				
				woodTotal = score.yellow;
				
				score.yellow = 0;
				
				
			}
			
			
  		}
  		if(data.team == "red"){
			
			if(score.red >= 250){
			
  				score.red -= 250;
				
			
			}else{
				
				woodTotal = score.red;
				
				score.red = 0;
				
				
			}
			
  		}
  		if(data.team == "blue"){
			
			if(score.blue >= 250){
			
  				score.blue -= 250;
							
			}else{
				
				woodTotal = score.blue;
				
				score.blue = 0;
				
				
			}
			
  		}
  		if(data.team == "green"){
			
			if(score.green >= 250){
			
  				score.green -= 250;
							
			}else{
				
				woodTotal = score.green;
				
				score.green = 0;
				
				
			}
			
  		}
		
         io.sockets.emit('logged', {score: score});		
		 
		 console.log(woodTotal);
		 
		 socket.emit('stealTotal', {total: woodTotal})
		
	  });
	
	
	 socket.on('startgame', function(data){
		 
		 startsecond = new Date().getTime() / 1000;
		 
    	io.sockets.emit('startgame', {players: players, trees: trees, notes: notes});
	  
  		  io.sockets.emit('update_clients', {players: players});
	  	  
		  started = true;
	  
	  
 	});
	
	socket.on("sendChat", function(data){
	 
	 	players[data.player].chatText = data.message;
	 	players[data.player].chatting = true;
		
		setTimeout(function() { 
		 	players[data.player].chatting = false;
			
			
		 }, 5000);
		
		
	});
		
	
	
	if(started == true){
		
    	io.sockets.emit('startgame', {players: players, trees: trees, notes: notes});
	  
  		  io.sockets.emit('update_clients', {players: players});
	}
	
	
    socket.on('arm', function(data){
	
		players[data.number].attacking = data.armed;
	
	});
	    
	 //testing123
	    socket.on('slash', function(data){
	
		players[data.number].slashing = data.slashed;
	
	});
	
    socket.on('getNote', function(data){
		
	 	notes[data.number].removed = true;
		
        io.sockets.emit('noteGot', {number: data.number});
	
	});
	
    socket.on('depLog', function(data){
	
		if(data.team == "yellow"){
			
			score.yellow += data.amount;
			
		}
		if(data.team == "red"){
			
			score.red += data.amount;
			
			
		}
		if(data.team == "blue"){
			
			score.blue += data.amount;
			
			
		}
		if(data.team == "green"){
			
			
			score.green += data.amount;
			
		}
		
        io.sockets.emit('logged', {score: score});
		
		
		//console.log(score);
	
	});
	
	
	
    socket.on('chopTree', function(data){
		
	 	trees[data.number].removed = true;
		
        io.sockets.emit('treeChopped', {number: data.number});
	
	});
	
	
	socket.on('disconnect', function(data){
		
		
	});

socket.on('player_killed', function(data){
	
	//console.log('player killed');
	
	players[data.number].dead = true;	
	
	do{
		
		free = true;
		
		spawn[data.number] = getSpawnXY(data.number);
		
		for(i = 0; i < players.length; i++){
		
			if(i != data.number){
		
				if(checkCollision(spawn[data.number], players[i], 41, 36, 41, 36, 0, 0)){
				
					free = false;
		
				}
			
			}
		}
		
		
	}while(!free);
	
	setTimeout(function() { 
		players[data.number].x = spawn[data.number].x;
		players[data.number].y = spawn[data.number].y;
		players[data.number].dead = false;
		players[data.number].PAPABEAR = false;
		//players[data.number].swordBearer = false;
		
	 }, 8000);
	  

});

socket.on('quick_kill', function(data){
	
	//console.log('player killed');
	
	players[data.number].dead = true;	
	
	do{
		
		free = true;
		
		spawn[data.number] = getSpawnXY(data.number);
		
		for(i = 0; i < players.length; i++){
		
			if(i != data.number){
		
				if(checkCollision(spawn[data.number], players[i], 41, 36, 41, 36, 0, 0)){
				
					free = false;
		
				}
			
			}
		}
		
		
	}while(!free);
	
	setTimeout(function() { 
		players[data.number].x = spawn[data.number].x;
		players[data.number].y = spawn[data.number].y;
		players[data.number].dead = false;
		players[data.number].PAPABEAR = false;
		//players[data.number].swordBearer = false;
		
	 }, 100);
	  

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
	
	  // promise = checkIt(data.number);
	  
	  // promise.then(function(){
	   	
			//if(!illegal){
		
				//players[data.number].x = checkers[data.number];
		
				//}
		
	  // });
	 
  });
  
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
  

socket.on('disconnect', function (data) {

       //socket.emit('disconnected');

   });
   
});

function updateClients() {
	
	if(started == true){
		
		currentseconds = new Date().getTime() / 1000;
		elapsedseconds = Math.floor(currentseconds - startsecond);

		io.sockets.emit('update_clients', {players: players, time: elapsedseconds});
   
	}

}

// updates clients every 
setInterval(updateClients, 0);