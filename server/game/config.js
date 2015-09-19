//collision objects
//remove non socket logic from socket.js
//allow master to enter as a player
//allow spectator
//collisions with bases
//setup Server?
//start with test config
//fix papabear getting stuck
//move all log stuff to server

module.exports = function(game){
	
	var Team = require('./team.js')(game);
	var Player = require('./player.js')(game);

	new Team('blue', {x: 10, y: 10, width: 10, height: 10});

	new Team("red", {x: 30, y: 30, width: 10, height: 10});

	new Team("green", {x: 50, y: 50, width: 10, height: 10});
	
	// game.defineTerritory("forest", {x: 0, y: 0, height: game.size.height, width: 5});
	// game.defineTerritory("forest", {x: 0, y: 0, height: 5, width: game.size.width});
	
	game.spawnNotesAndTrees();
	
}