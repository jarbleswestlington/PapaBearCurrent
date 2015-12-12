var powers = require('./powers.js').powers;
var Obj = require('./objects.js').Obj;

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pedigojon@gmail.com',
        pass: process.env.GMAIL_PASS,
    }
}, {
    // default values for sendMail method
    from: 'pedigojon@gmail.com',
    headers: {
        'Hi': '123'
    }
});

var localio;
var access = {};
access.emit = function(name, data){
	localio.sockets.emit(name, data);
}

function setUp(game, server){
	//setUp sockets
	var io = require('pedig.io').listen(server, {'destroy buffer size': Infinity });
	io.set('log level', 1);

	io.sockets.on('connection', function(socket) {
		
		console.log("connection has opened on " + socket.id);

		console.log("started game on " + socket.id)

		game.send(socket);

		if(game.updating == false) game.update(io);

		if(game.started) game.start(socket);
		
		socket.on("drop_log", function(data){
			var player = game.findPlayerByName(data.name)
			player.log.has = false;
			player.log.stolen = false;
			player.log.wood = 0;
			player.addUpdate("log");
		
		});

		socket.on("confirm_name", function(data){

			console.log("confirmed player "+data.name+" on socket" + socket.id)

			game.elephant[data.name] = socket;

			var player = game.findPlayerByName(data.name)
			
			if(!player) player = game.addPlayer(data.name, data.master);

			player.spawn();

			game.elephant[data.name].emit("name_confirmed", {player: player});

		});

		socket.on('startgame_server', function(data){

			game.startsecond = new Date().getTime() / 1000;

			game.state = "started";	

			game.started = true;

			game.start(io.sockets);

			transporter.sendMail({
			    to: '7082204254@txt.att.net',
			    subject: 'Papa Bear',
			    text: 'A Papa Bear game just got started'
			});
			console.log("started game on " + socket.id)
			
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
			player.log.stolen = true;
			player.log.wood = woodTotal;
			player.addUpdate("log");
			team.addUpdate("score");

			socket.emit('stealTotal', {total: woodTotal})

		});

		socket.on("sendChat", function(data){

			var player = game.findPlayerByName(data.name);


			if(player.master){
				if(data.message == "woodplz"){
					var team = game.teams[player.team];
					team.score += 1000;
					team.addUpdate("score");
					return;
				} 
				if(powers.index[data.message]){
					powers.index[data.message].giveTo(player);
					player.addUpdate("powers");
					return;
				}
			}

			player.chatText = data.message;
			player.chatting = true;
			player.addUpdate("chatting", "chatText");

			if(!data.time) data.time = 5000;

			setTimeout(function() { 
				player.addUpdate("chatting");
			 	player.chatting = false;	
			 }, data.time);

		});
		
		socket.on('change_team', function(data){

			var player = game.findPlayerByName(data.name);
			
			if(player.renderteam != data.team){ 
				player.renderteam = data.team;
				player.addUpdate("renderteam");
				console.log(player.name + " disguised themself as the " + data.team + " team");
			}
			
		});

		socket.on('use_power', function(data){

			var player = game.findPlayerByName(data.name);

			if(!player.powers[data.power]) return;
			var power = powers.index[data.power];
			if(!power.onUse) return;

			power.onUse(player);
 
		});

		socket.on('getNote', function(data){

			note = game.grid[data.gridCoords.x][data.gridCoords.y].contains;
			note.removed = true;

			setTimeout(function(){
				this.removed = false;
				io.sockets.emit('noteSpawn', {gridCoords: data.gridCoords});
			}.bind(note), 2 * 60000);

			io.sockets.emit('noteGot', {gridCoords: data.gridCoords});

		});

		socket.on('depLog', function(data){

			var player = game.findPlayerByName(data.name);

			player.log.has = false;
			player.log.wood = 0;
			player.addUpdate("log");

			game.teams[data.team].score += data.amount;
			game.addUpdate("teams");


		});

		socket.on('chopTree', function(data){

			var player = game.findPlayerByName(data.name);

			player.log.has = true;
			player.log.wood = 50;

			player.addUpdate("log");

			game.grid[data.gridCoords.x][data.gridCoords.y].contains.removed = true;
			io.sockets.emit('treeChopped', {gridCoords: data.gridCoords});

		});
		
		socket.on('chop_wall', function(data){
			game.objects[data.index].hp -= data.amount;

			if(game.objects[data.index].hp <= 0){
				game.objects[data.index].removed = true;
				io.sockets.emit("remove_object", {index: data.index});
			}
		});
		
		socket.on('play_everywhere', function(data){

			io.sockets.emit('play_sound', {sound: data.name, coords: data.coords, level: data.level});

		});

		socket.on('move_input', function(data){

			var player = game.findPlayerByName(data.name);

			var dummy = player.dummy;

			if(!player || player.dead) return;

			if(data.direction == "up"){

			   dummy.y -= data.amount;

			   player.direction = "U";

			}
			if(data.direction == "down"){

			   dummy.y += data.amount;
			   player.direction = "D";

			}
			if(data.direction == "left"){

			   dummy.x -= data.amount;
			   player.direction = "L";

			}
			if(data.direction == "right"){

			   dummy.x += data.amount;
			   player.direction = "R";

			}
			player.addUpdate("direction");
	
		});
		
		socket.on("request_placement", function(data){
			
			var illegal = game.collideCheck(data);
			
			if(illegal)	socket.emit("placement_result", {success:false});
			else{ 
				var newObj = new Obj(data);
				game.objects.push(newObj)
				io.sockets.emit("add_object", newObj);
				socket.emit("placement_result", {success:true});
			}
		});
		
		socket.on("remove_object", function(data){
			
			game.objects[data.index].removed = true;
			io.sockets.emit("remove_object", data);
			
		});
  
		socket.on("give_power", function(data){

			var player = game.findPlayerByName(data.name);

			if(data.power == "all"){
				for(var power in powers.index){
					if(!powers.index[power].exclusive) powers.index[power].giveTo(player);
				}
			}else{
				var powerGive = powers.index[data.power];
				if(powerGive) powerGive.giveTo(player);
				game.powerStatsUpdate(data.power);

			}

		});

		socket.on('left_game', function(data) {
			var player = game.findPlayerByName(data.name);
			if(!player) return;
			player.removed = true;
			game.playersCount--;
			game.addUpdate("playersCount");

			if(player.host) game.hasHost = false;
			player.addUpdate("removed");
		});
	});
	
	localio = io;
	return io;
}



module.exports = {
	access: access,
	setUp: setUp,
}

