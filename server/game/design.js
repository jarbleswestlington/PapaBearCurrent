//collision objects
//remove non socket logic from socket.js
//start with test config
//move all log stuff to server
//move notes to server...move powers to server...
//configurable random generation of trees and bases and stuff
//actually have users powers point at a power//no should never happen..only game should have reference to things

//have notes on back-end
//interface = object, object {distance: onBreach: condition: }
//collide = object, object, {padding: , onCollide}

//generally fix the requiring of things
//socket needs everthing, everything needs socket (use access);
//game needs everything, everything needs an instance of the game

//respawning requires 250 wood

module.exports = function(game, io){
	
	var Team = require('./team.js')(game, io);
	var Player = require('./player.js')(game, io);
	var Power = require('./powers.js').Power;
	var Obj = require('./objects.js').Obj;

	new Team('blue', {x: 5, y: 5, width: 10, height: 8});
	new Team("red", {x: 16, y: 43, width: 7, height: 5});
	new Team("green", {x: 42, y: 21, width: 10, height: 8});
	

	game.defineTerritory("forest", {x: 0, y: 0, height: game.size.height, width: 5});
	game.defineTerritory("forest", {x: 0, y: 0, height: 5, width: game.size.width});
	
	game.defineTerritory("tree", {x: 0, y: 0, height: 1, width: 1});

	game.defineTerritory("boulder", {x: 27, y: 27, height: 5, width: 5});

	var boulder = new Obj({
	 type: "boulder",
	 tag: "boulder",
	 hard: true,
	 x: 2220,
	 y: 2220,
	 width: 169,
	 height: 122, 
	});
	game.objects.push(boulder);

	game.generate();

	new Power("spear", {
		group: "weapon",
		exclusive: true,
		onRecieve: function(player){
			player.spear.image = "spear";
			player.attacking = true;
			player.addUpdate("attacking");
			player.addUpdate("spear");
		},
		onUse: function(player){
			player.attacking = !player.attacking;
			player.addUpdate("attacking");
		},
		onLose: function(player){
			player.attacking = false;
			player.addUpdate("attacking");
		},
		droppable:true,
	});
	new Power("powerWeapon", {
		onRecieve: function(player){
			player.spear.image = "spearP";
			player.addUpdate("spear");
		},
		onLose: function(player){
			player.spear.image = "spear";
			player.addUpdate("spear");
		},
		include: ["spear"],
		group:"weapon",
		exclusive: true,
		droppable:true,
	});

	new Power("sword", {group: "weapon", droppable: true, exclusive: true,
	    onUse: function(player){	
			player.weapon.state = "winding up";
			player.addUpdate("weapon");

			setTimeout(function() { 
				player.weapon.state = "attacking";
				player.frozen = true;
				player.addUpdate("weapon", "frozen");
				player.swipe();
			}, 250);

			setTimeout(function() { 
			}, 600);
	
			setTimeout(function() { 
				player.weapon.state = "ready";
				player.frozen = false;
				player.addUpdate("weapon", "frozen");
			}, 1800);
	    },
	});

	new Power("dash", {
		key: "S",	
		exclusive: true,
		droppable: true,
		group:"support",
		dropImg: "dashboots",
	});

	new Power("hammer", {
		key: "D",	
		exclusive: true,
		default: true,
		group:"build",
		dropImg: "hammerDia",
	});


	new Power("disguise", {
		key: "S",	
		exclusive: true,
		droppable: true,
		group:"support",
		dropImg: "disguise",
		onUse: function(player){

			var go = false;
			game.forAllTeams(function(team){
				if(go){
					player.renderteam = team.name;
					go = false;
				}else if(team.name == player.renderteam){

					go = true;
				}
			});

			if(go){
				for(var team in game.teams){
					player.renderteam = game.teams[team].name;
					break;
				}
			}

			player.addUpdate("renderteam");
		},
		onLose: function(player){
			player.renderteam = player.team;
			player.addUpdate("renderteam");
		}

	});
	new Power("invisibility", {
		key: "S",	
		exclusive: true,
		droppable: true,
		group:"support",
		dropImg: "cloak",
		onRecieve: function(player){
			player.render = false;
			player.addUpdate("render");
		},
		onLose: function(player){
			player.render = true;
			player.addUpdate("render");
		}
	});
	new Power("telescope",{		
		key: "S",	
		exclusive: true,
		droppable: true,
		group:"support",
		dropImg: "telescope",
		onUse: function(player){
			player.freeCamera = !player.freeCamera;
			player.addUpdate("freeCamera");
		},
		onLose: function(player){
			player.freeCamera = false;
			player.addUpdate("freeCamera");
		}
	});
	new Power("papaBear", {
		exclusive: true,
		onRecieve: function(player){
			player.x -= player.x%78;
			player.x+=6;
			player.y -= player.y%78;
			player.y+=6;
			player.width = 63;
			player.height = 63;
			player.tag = "papaBear";
			player.addUpdate("x","y","width","height","tag");

			var roarLoop = function(){
				if(!player.powers.papaBear) return;
				var delay = 5000 + (Math.random() * 15000);
				io.sockets.emit('play_sound', {sound: "bear", coords: {x:player.x, y: player.y}, level: 120} );
				setTimeout(roarLoop, delay);
			}; 

			roarLoop();

		},
		onLose: function(player){
			player.width = 41;
			player.height = 36;	
			player.tag = "player";	
			player.addUpdate("width","height","tag");
		}
	});

	
}