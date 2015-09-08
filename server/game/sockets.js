module.exports = function(server, game){
	
	//setUp sockets
	var io = require('socket.io').listen(server);
	io.set('log level', 1);

	io.sockets.on('connection', function(socket) {

		if(game.state == "started"){
		
			console.log("started game on " + socket.id)
			game.start(io);
		}
	
		socket.on("confirm_name", function(data){
		
			console.log("confirmed name: "+data.name+" on " + socket.id)

			game.elephant[data.name] = socket;
		
			var player = game.findPlayerByName(data.name)
		
			game.elephant[data.name].emit("name_confirmed", {player: player});
		
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
		
	    socket.on('attacked', function(data){
		
	    	var player = game.findPlayerByName(data.name);
			
			player.swipe();
		
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

		if(!player || player.dead) return;
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
			console.log(data.power + " given to Player:" + data.name);
	
	  });
  

	});
	
	return {io: io};
}


