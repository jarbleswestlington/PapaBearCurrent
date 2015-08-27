var http = require('http'),
express = require("express"),
app = express(),
fs   = require('fs');

//setUp game
var Game = require('./server.js');
game = new Game();
var Team = require('./team-player.js')(game).Team;
var Player = require('./team-player.js')(game).Player;

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
   
   if(!game.hasPlayer(pName)){
	   
	  // console.log("wouldnt have run");
   }
   game.addPlayer(pName, pName == "master" ? true : false);

   res.write(index);

   res.end();

});

//setUp sockets
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io').listen(server, { log: false });
io.set('log level', 1);

var elephant = {};

io.sockets.on('connection', function(socket) {

	if(game.state == "started"){
		
		console.log("started game on " + socket.id)
		game.start(io);
	}
	
	socket.on("confirm_name", function(data){
		
		console.log("confirmed name: "+data.name+" on " + socket.id)

		elephant[data.name] = socket;
		
		elephant[data.name].emit("name_confirmed", {name: data.name});
		
	});

	socket.on('startgame_server', function(data){
		 
		game.startsecond = new Date().getTime() / 1000;

		game.state = "started";	
		
		game.start(io);

		console.log("started game on " + socket.id)

		setInterval( game.update.bind(game, io) , 200);
		//process.nextTick(function(){ game.update(io) } );
	  
 	});

	socket.on('stealWood', function(data){
		  
		var woodTotal = 250;
		
		var team = game.teams[data.team];
		
		if(team.score >= 250){
			
  			team.score -= 250;
				
			
		}else{
			
			woodTotal = team.score;
			
			team.score = 0;
			
				
		}
				 		 
		socket.emit('stealTotal', {total: woodTotal})
		
	});
	
	socket.on("sendChat", function(data){

		var player = game.findPlayerByName(data.name);
	 
	 	player.chatText = data.message;
	 	player.chatting = true;
		
		setTimeout(function() { 
		 	player.chatting = false;	
		 }, 5000);

	});
		
    socket.on('arm', function(data){

    	var player = game.findPlayerByName(data.name);
	
		player.attacking = data.armed;
	
	});
	    
	socket.on('slash', function(data){

		var player = game.findPlayerByName(data.player.name);
	
		player.slashing = data.slashed;
	
	});
	
    socket.on('getNote', function(data){
		
	 	game.notes[data.id].removed = true;
		io.sockets.emit('noteGot', {number: data.id});

	});
	
    socket.on('depLog', function(data){
		
		game.teams[data.team].score += data.amount;
			
	});
	
    socket.on('chopTree', function(data){
		
	 	game.trees[data.id].removed = true;
		io.sockets.emit('treeChopped', {number: data.id});

	});
	
	socket.on('move_input', function(data){

   	var dummy = {};
	var player = game.findPlayerByName(data.name);

	if(!player) return;
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
  
	socket.on("give_power", function(data){
	  
		var player = game.findPlayerByName(data.name);

		player.powers[data.power] = true;
	
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


