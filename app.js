var http = require('http');
var q = require('q');

var express = require("express"),
   app = express(),
   //formidable = require('formidable'),
   util = require('util')
   fs   = require('fs-extra'),
   qt   = require('quickthumb'),
   fsog = require('fs'),

   index = fsog.readFileSync(__dirname + '/index.html');


var server = app.listen(process.env.PORT || 3000);

var io = require('socket.io').listen(server);

// Use quickthumb
app.use(qt.static(__dirname + '/'));

//index
app.get('/', function (req, res){

   res.writeHead(200, {'content-type': 'text/html'});

   res.write(index);
   //res.write(countdown);

   res.end();

});
var treeNum = 1;
var joined = 0;
var playerCount = 0;

var players = [];
var check = [];
var illegal = [];


var started = false;

var arr = [];
for (var i = 0; i < 1000; i++) {

	arr.push(Math.round(Math.random() * 3));
	
}

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

function getSpawnXY(playerNumber){

 
spawnX = 0;

spawnY = 0;


if (players[playerNumber].team == "blue") {

 

  spawnX = 1300 + (100 * Math.random() * 4);

  spawnY = 1300 + (100 * Math.random() * 4);

    

}else if (players[playerNumber].team == "red") {

 

  spawnX = 3400 - (100 * Math.random() * 4);

  spawnY = 2300 + (100 * Math.random() * 4);

 

  }

else if (players[playerNumber].team == "green") {

 

  spawnX = 1300 + (100 * Math.random() * 4);

  spawnY = 3400 - (100 * Math.random() * 4); 


  }

else{


  spawnX = 3120 - (100 * Math.random() * 4);

  spawnY = 3120 - (100 * Math.random() * 4);
 

  }


  return {x: spawnX, y: spawnY};

}
 


var trees = [];
var notes = [];

for(i = 0; i < 60; i++){
	
	for(j = 0; j < 60; j++){
		
		if((j < 15 || i < 15) || (j > 45 || i > 45)){

			chance = Math.random() * 100;
		
			if(chance <= 65){
			
				trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
			
			
			}
			if(chance > 65 && chance <= 68){
			
				notes.push({x: i * 78, y: j * 78, removed: false});
			
			
			}
			if(chance > 68){
			
			
			}
		
		}
		if(j > 14 && i > 14 && j < 46 && i < 46){

			if(j > 14 && i > 19 && j < 24 && i < 46){

					chance = Math.random() * 100;
		
					if(chance <= 40){
					
						trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
					
					
					}
					if(chance > 89 && chance <= 90){
					
						notes.push({x: i * 78, y: j * 78, removed: false});
					}

			}else if (j > 23 && i > 14 && j < 38 && i < 41) {

					chance = Math.random() * 100;
		
					if(chance <= 40){
					
						trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
					
					
					}
					if(chance > 89 && chance <= 90){
					
						notes.push({x: i * 78, y: j * 78, removed: false});
					}

			}else if (j > 37 && i > 19 && j < 46 && i < 46) {

					chance = Math.random() * 100;
		
					if(chance <= 40){
					
						trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
					
					
					}
					if(chance > 89 && chance <= 90){
					
						notes.push({x: i * 78, y: j * 78, removed: false});
					}

			}
	
		}	
	}
}

score = {
	
	red: 0,
	blue: 0,
	yellow: 0,
	green: 0
}

var blueTeam=0;
var redTeam=0;
var greenTeam=0;
var yellowTeam=0;

teamToSend = "";
spawnX = 0;
spanwY = 0;

var spawn = [];

var startsecond = 0;

var threeteams = true;


io.sockets.on('connection', function(socket) {
	

	if(playerCount == 0){

 
		teamToSend = "master";

		spawnX = 0;

		spawnY = 0;

 

	}else{

 

	if (blueTeam <= redTeam) {

 

		  teamToSend = "blue";

		  blueTeam = blueTeam + 1;

		  spawnX = 1300 + (50 * blueTeam);

		  spawnY = 1400;

  

	}else if (redTeam < greenTeam) {

 

		  teamToSend = "red";

		  redTeam = redTeam + 1;

 

		  spawnX = 3400 - (50 * redTeam);

		  spawnY = 2300;

 

	  }

	else if (greenTeam < yellowTeam || threeteams) { 

 

		  teamToSend = "green";

		  greenTeam = greenTeam + 1;

 

		  spawnX = 1300 + (50 * greenTeam);

		  spawnY = 3400;

 

	}

	else{


		    teamToSend= "yellow";

		    yellowTeam = yellowTeam + 1;

 

		    spawnX = 3120 + (50 * yellowTeam);

		    spawnY = 3120;

 

		  }

 

	  }
	
	  players.push({
		  x: spawnX, 
		  y: spawnY,
		direction: "D",
		attacking: false,
		slashing: false,
		character: Math.floor((Math.random() * 3) + 1),
		team: teamToSend,
		renderteam:teamToSend,
		canDisguise: false,
		swordBearer: false,
		chosenOne: false,
		PAPABEAR: false,
		dead: false,
		  chatting: false,
		  chatText: ""
		  
	  });
	  
	  check.push({x: spawnX, y: spawnY});
	  
	  illegal.push(false);
	  
	  socket.emit('set_player',  {number: playerCount, players: players});
	  
	  socket.on('player_added', function(){
	  	
		  playerCount++;
		
	  });
	
	  
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