module.exports = function(game){
	
	var Player = require("./player.js")(game);
	
	var Team = function(name, coord){
	
		this.score = 0;
		this.name = name;
		this.players = [];
		this.baseX = coord.x;
		this.baseY = coord.y;
		this.base = coord;

		game.teams[name] = this;

	};

	Team.prototype.addPlayer = function(name){

		var newPlayer = new Player({name: name, team: this.name});
		
		newPlayer.spawn();
		
		this.players.push(newPlayer);
	};

	return Team;
};

