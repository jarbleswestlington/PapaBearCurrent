module.exports = function(game){
	var Player = require('./player.js')(game);
		
	var Team = function(name, coord){
	
		this.score = 0;
		this.name = name;
		this.players = [];
		this.x = coord.x;
		this.y = coord.y;
		this.baseX = (coord.x + (coord.width/2)) * 78;
		this.baseY = (coord.y + (coord.height/2)) * 78;
		this.base = coord;
		this.width = coord.width;
		this.height = coord.height;
		
		game.defineTerritory("team", coord);
		game.teams[name] = this;
		
	};

	Team.prototype.addPlayer = function(name){
		
		newPlayer = new Player({name: name, team: this.name})
		
		newPlayer.spawn();
		
		this.players.push(newPlayer);
	};

	return Team;
};

