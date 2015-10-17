//collision objects
//remove non socket logic from socket.js
//start with test config
//move all log stuff to server
//move notes to server...move powers to server...
//configurable random generation of trees and bases and stuff
//actually have users powers point at a power//no should never happen..only game should have reference to things

//have notes on back-end
//organize things into one master array - objects//toRender//toCollide
//interface = object, object {distance: onBreach: condition: }
//collide = object, object, {padding: , onCollide}
//onUse swordPower -- renderer.add(sword), renderer.remove(sword)

//generally fix the requiring of things
//socket needs everthing, everything needs socket (use access);
//game needs everything, everything needs an instance of the game

module.exports = function(game, io){
	
	var Team = require('./team.js')(game, io);
	var Player = require('./player.js')(game, io);
	var Power = require('./powers.js').Power;

	new Team('blue', {x: 10, y: 10, width: 10, height: 10});
	new Team("red", {x: 30, y: 30, width: 10, height: 10});
	new Team("green", {x: 50, y: 50, width: 10, height: 10});
	
	game.defineTerritory("forest", {x: 0, y: 0, height: game.size.height, width: 5});
	game.defineTerritory("forest", {x: 0, y: 0, height: 5, width: game.size.width});
	
	game.generate();

	new Power("spear", {
		group: "weapon",
		exclusive: true,
		onRecieve: function(player){
			player.spear.color = "grey";
			player.addUpdate("spear");
		},
		droppable:true,
	});
	new Power("powerWeapon", {
		onRecieve: function(player){
			player.spear.color = "yellow";
			player.addUpdate("spear");
		},
		onLose: function(player){
			player.spear.color = "grey";
			player.addUpdate("spear");
		},
		include: ["spear"],
		group:"weapon",
		exclusive: true,
		droppable:true,
	});
	new Power("disguise");
	new Power("invisibility", {exclusive: true,	
		onRecieve: function(player){
			player.render = false;
			player.addUpdate("render");
		},
		onLose: function(player){
			player.render = true;
			player.addUpdate("render");
		}
	});
	new Power("telescope");
	new Power("sword", {group: "weapon", droppable: true, exclusive: true});
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
		},
		onLose: function(player){
			player.width = 41;
			player.height = 36;	
			player.tag = "player";	
			player.addUpdate("width","height","tag");
		}
	});

	
}