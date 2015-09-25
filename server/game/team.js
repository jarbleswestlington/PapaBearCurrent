module.exports = function(game, io){
	var Player = require('./player.js')(game, io);
		
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

		this.draw = function(){
			//actual base
			renderer.drawImage('house' + this.name, this.baseX, this.baseY);
			
			this.drawScore();
		}

		this.drawScore = function(){
			//wood piles
			var row = 1;
			var col = 1;
			var x = 0;
			var y = 0;
			for(var i = 1; i < this.score; i+= 150){
				col += .5;
				if(row < 2) row += 1;
				else row = 1;
				x = -Math.floor(col) * 24;
				y = -Math.floor(row) * 26;
				renderer.drawImage("pile", (this.baseX - 53) + x, (this.baseY + 61) + y);
			}
			//baseScore
			ctx.fillStyle = "white";
			ctx.font="11px Georgia";
			renderer.fillText(this.score, this.baseX - 3, this.baseY + 65);
		}
	};
	
	Team.prototype.baseColBoxes = [
		{x: 0, y: 20, width: 40, height: 50},
		{x: 40, y: 4, width: 80, height: 66},
		{x: 120, y: 20, width: 40, height: 50},
		
	];

	Team.prototype.addPlayer = function(name){
		
		newPlayer = new Player({name: name, team: this.name})
		
		newPlayer.spawn();
		
		this.players.push(newPlayer);
		
		return newPlayer;
	};

	return Team;
};

