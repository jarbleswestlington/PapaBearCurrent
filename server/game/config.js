module.exports = function(game){
	
	var Team = require('./team.js')(game);
	var Player = require('./player.js')(game);

	game.spawnNotesAndTrees();

	var blueTeam = new Team('blue', {x:1300, y:1500});

	var redteam = new Team("red", {x:3400, y:2300});

	var greenTeam = new Team("green", {x:1300, y:3400});

}