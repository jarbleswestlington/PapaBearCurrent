//collision objects
//remove non socket logic from socket.js
//start with test config
//move all log stuff to server
//move notes to server...move powers to server...
//configurable random generation of trees and bases and stuff
//actually have users powers point at a power
//have notes on back-end
//organize things into one master array - objects//toRender//toCollide
//interface = object, object {distance: onBreach: condition: }
//collide = object, object, {padding: , onCollide}
//onUse swordPower -- renderer.add(sword)
//make collisions function automatically tell whos bigger and smaller;//


module.exports = function(game, io){
	
	var Team = require('./team.js')(game, io);
	var Player = require('./player.js')(game, io);

	new Team('blue', {x: 10, y: 10, width: 10, height: 10});

	new Team("red", {x: 30, y: 30, width: 10, height: 10});

	new Team("green", {x: 50, y: 50, width: 10, height: 10});
	
	game.defineTerritory("forest", {x: 0, y: 0, height: game.size.height, width: 5});
	game.defineTerritory("forest", {x: 0, y: 0, height: 5, width: game.size.width});
	
	game.spawnNotesAndTrees();
	
}