//collision objects
//remove non socket logic from socket.js
//allow master to enter as a player
//allow spectator
//collisions with bases
//setup Server
//start with test config
//fix papabear getting stuck
//move all log stuff to server

module.exports = function(game){
	
	var Team = require('./team.js')(game);
	var Player = require('./player.js')(game);

	game.spawnNotesAndTrees();

	var blueTeam = new Team('blue', {x:1300, y:1500});

	var redteam = new Team("red", {x:3400, y:2300});

	var greenTeam = new Team("green", {x:1300, y:3400});

}