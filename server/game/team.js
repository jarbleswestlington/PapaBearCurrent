var tools = require('./tools.js');

module.exports = function(game, io){
	var Player = require('./player.js')(game);
		
	var Team = function(name, coord){
	
		this.score = 0;
		this.name = name;
		this.playersCount = 0;
		this.x = coord.x;
		this.y = coord.y;
		this.baseX = (coord.x + (coord.width/2)) * 78;
		this.baseY = (coord.y + (coord.height/2)) * 78;
		this.width = coord.width;
		this.height = coord.height;
		this.base = { x:(coord.x + (coord.width/2)) * 78, y: (coord.y + (coord.height/2)) * 78}
		game.defineTerritory("team", coord);
		game.teams[name] = this;
		this.updated = {};

		this.tag = "base";
		this.draw = function(){
			//actual base
			renderer.drawImage('house' + this.name, this.baseX, this.baseY);
			
			this.drawScore();
		}

		this.drawScore = function(){
			//wood piles
			var row = 2;
			var col = 1;
			var x = 0;
			var y = 0;
			var offest = 0;
			for(var i = 1; i < this.score; i+= 150){
				col += .5;
				if(row < 2){ 
					row += 1;
					var offset = 6;
				}else{
					row = 1;
					var offset = 0;
				}

				x = -Math.floor(col) * 24 + offset;
				y = -Math.floor(row) * 14;

				renderer.drawImage("pile", (this.baseX - 53) + x, (this.baseY + 78) + y);
			}
			//scoreSign
			renderer.drawImage("counter", this.baseX - 28, this.baseY + 50);
			//baseScore
			ctx.fillStyle = "white";
			ctx.font="11px Georgia";
			renderer.fillText(this.score, this.baseX - 23, this.baseY + 66);
		}
	};
	
	Team.prototype.baseColBoxes = [
		{x: 0, y: 20, width: 40, height: 50},
		{x: 40, y: 4, width: 80, height: 66},
		{x: 120, y: 20, width: 40, height: 50},
		
	];

	Team.prototype.collide = function(agent){
		var boxes = this.baseColBoxes;

		for(var i = 0;i < boxes.length; i++){
			if(tools.colCheckRelative(agent, {item: boxes[i], influencer: {x: this.baseX, y: this.baseY} } )){
				return true;
			} 
		}
		return false;
	}

	Team.prototype.addUpdate = function(arg){
		if(arg == "all"){
			this.updated = {};
			for(var prop in this){
				if(this.hasOwnProperty(prop) && this[prop] !== null && this[prop] !== undefined){
					this.updated[prop] = true;
				}
			}
		}else{
			[].slice.call(arguments).forEach(function(prop){

				this.updated[prop] = true;

			}.bind(this));
		}
		game.addUpdate("teams");
	}

	Team.prototype.totalAlivePlayers = function(){

		var alive = game.getTeamPlayers(this.name).filter(function(player){
			if(!player.dead) return true;
		});

		return alive.length;
	}

	Team.prototype.isExtinct = function(){
		if(this.totalAlivePlayers() <= 0 && this.score < 250) return true;
		else return false;
	}

	return Team;
};

