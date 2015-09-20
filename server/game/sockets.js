module.exports = function(server, game){
	
	//setUp sockets
	var io = require('socket.io').listen(server);
	io.set('log level', 1);

	io.sockets.on('connection', function(socket) {

		if(game.state == "started"){

			console.log("started game on " + socket.id)
			game.start(io);
		}
		
		socket.on("drop_log", function(data){
			var player = game.findPlayerByName(data.name)
		
			player.log.has = false;
			player.log.stolen = false;
		
		});

		socket.on("confirm_name", function(data){

			console.log("confirmed player "+data.name+" on socket" + socket.id)

			game.elephant[data.name] = socket;

			var player = game.findPlayerByName(data.name)

			game.elephant[data.name].emit("name_confirmed", {player: player});

		});

		socket.on('startgame_server', function(data){

			game.startsecond = new Date().getTime() / 1000;

			game.state = "started";	

			game.start(io);

			console.log("started game on " + socket.id)
			
			setTimeout( game.update.bind(game, io) , 0);
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

			var player = game.findPlayerByName(data.name);

			player.log.has = true;
	 		 
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
		
		socket.on('change_team', function(data){

			var player = game.findPlayerByName(data.name);
			
			if(player.renderteam != data.team){ 
				player.renderteam = data.team;
				console.log(player.name + " disguised themself as the " + data.team + " team");
			}
			
		});

		socket.on('begin_swipe', function(data){

			var player = game.findPlayerByName(data.name);

			player.weapon.state = "winding up";

			setTimeout(function() { 
				player.weapon.state = "attacking";
				player.frozen = true;
				player.swipe();
			}, 250);

			setTimeout(function() { 
			}, 600);
	
			setTimeout(function() { 
				player.weapon.state = "ready";
				player.frozen = false;
			}, 1800);
 
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

			var player = game.findPlayerByName(data.name);

			player.log.has = false;

			game.teams[data.team].score += data.amount;

		});

		socket.on('chopTree', function(data){

			var player = game.findPlayerByName(data.name);

			player.log.has = true;

			game.trees[data.id].removed = true;

			io.sockets.emit('treeChopped', {number: data.id});

		});
		
		socket.on('play_everywhere', function(data){

			socket.broadcast.emit('play_sound', {sound: data.name, coords: data.coords, level: data.level});

		});

		socket.on('move_input', function(data){

			var dummy = {};
			var player = game.findPlayerByName(data.name);

			if(!player || player.dead) return;
			dummy.x = player.x;
			dummy.y = player.y;
			dummy.width = player.width;
			dummy.height = player.height;

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
			
			if(!player.checkCollisions(dummy)){
				
				player.x = dummy.x;
				player.y = dummy.y;
			}
			
			player.checkHits();

		});
		
		socket.on("add_object", function(data){
			
			game.objects.push(data);
			io.sockets.emit("add_object", data);
			
		});
		
		socket.on("remove_object", function(data){
			
			game.objects[data.index].removed = true;
			io.sockets.emit("remove_object", data);
			
		});
  
  
		socket.on("give_power", function(data){

			var player = game.findPlayerByName(data.name);
			player.powers[data.power] = true;
			
			if(data.power == "papaBear"){
				player.width = 78;
				player.height = 78;
			}
			
			console.log(data.power + " given to Player:" + data.name);

		});

	});
	
	return {io: io};
}


