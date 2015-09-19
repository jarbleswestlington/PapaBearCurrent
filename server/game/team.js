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
		this.width = coord.width;
		this.height = coord.height;
		this.base = { x:(coord.x + (coord.width/2)) * 78, y: (coord.y + (coord.height/2)) * 78}
		game.defineTerritory("team", coord);
		game.teams[name] = this;
	};
	
	Team.prototype.baseColBoxes = [
		{x: 0, y: 20, width: 40, height: 50},
		{x: 40, y: 8, width: 80, height: 62},
		{x: 120, y: 20, width: 40, height: 50},
		
	];

	Team.prototype.addPlayer = function(name){
		
		newPlayer = new Player({name: name, team: this.name})
		
		newPlayer.spawn();
		
		this.players.push(newPlayer);
	};

	return Team;
};

