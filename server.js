function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Game = function(){
	
	this.teams = {};
	this.check = [];
	this.illegal = [];
	
	this.master = undefined;
	
	this.currentSec = 0;
	
	this.treeNum = 1;
	this.joined = 0;
	this.playerCount = 0;
	
	this.started = false;

	this.trees = [];
	this.notes = [];
	this.currentTeamMax = 1;
	
	this.bearX = 22;
	this.bearY = 27;
	this.sockets = {};
};

Game.prototype.update = function(io) {
			
	var now = new Date().getTime() / 1000;
	this.currentSec = Math.floor(now - this.startsecond);

	io.sockets.emit('update_clients', {game: this, time: this.currentSec});
	
	//process.nextTick(function(){ this.update(io) }.bind(this) );
}

Game.prototype.checkCollision = function(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;

       }

   }
}

Game.prototype.forAllTeams = function(func){

	for(var name in this.teams){

		func(this.teams[name]);

	}

}

Game.prototype.forAllTrees = function(func){
	
	this.trees.forEach(function(tree){
		if(tree.removed == false) func(tree);
	})
}

Game.prototype.forAllPlayers = function(func){
	
	for(var name in this.teams){
		for(var i = 0; i < this.teams[name].players.length; i++){

			func(this.teams[name].players[i]);
		}
	}

}

Game.prototype.forAllOtherPlayers = function(player, func){

	for(var name in this.teams){

		for(var i = 0; i < this.teams[name].players.length; i++){

			if(player !== this.teams[name].players[i]) func(this.teams[name].players[i]);
		}
	}

}

Game.prototype.forAllOtherAlivePlayers = function(player, func){

	for(var name in this.teams){

		for(var i = 0; i < this.teams[name].players.length; i++){

			if(player !== this.teams[name].players[i] && !this.teams[name].players[i].dead) func(this.teams[name].players[i]);
		}
	}

}

Game.prototype.spawnNotesAndTrees = function(){
	
	for(var i = 0; i < 60; i++){
		
		for(var j = 0; j < 60; j++){
			
			if((j < 15 || i < 15) || (j > 45 || i > 45)){

				var chance = Math.random() * 100;
			
				if(chance <= 65){
				
					this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
				
				}
				if(chance > 65 && chance <= 68){
				
					this.notes.push({x: i * 78, y: j * 78, removed: false});
				
				
				}
				if(chance > 68){
				
				
				}
			
			}
			if(j > 14 && i > 14 && j < 46 && i < 46){

				if(j > 14 && i > 19 && j < 24 && i < 46){

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}else if (j > 23 && i > 14 && j < 38 && i < 41) {

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}else if (j > 37 && i > 19 && j < 46 && i < 46) {

						var chance = Math.random() * 100;
			
						if(chance <= 40){
						
							this.trees.push({x: i * 78, y: j * 78, removed: false, treeNum : getRandomInt(1,4)});
						
						
						}
						if(chance > 89 && chance <= 90){
						
							this.notes.push({x: i * 78, y: j * 78, removed: false});
						}

				}
		
			}	
		}
	}
	
}

Game.prototype.addPlayer = function(name, master){
		
	if(master){
		
		var joiningPlayer = {name: name, team: "master"};

	}else{ 
		
		var allMax = true;
		var aTeam = "";
		
		for(var tName in this.teams){
			
			var tLength = this.teams[tName].players.length;
			
			//check if all teams are at max
			if(tLength !== this.currentTeamMax) allMax = false;
			else aTeam = tName;
			
			if(tLength < this.currentTeamMax){
				
				this.teams[tName].addPlayer(name);
				
				break;
				
			}
		}
		
		//if all teams are at max
		if(allMax && aTeam != ""){
			
			this.currentTeamMax++;
			
			this.teams[aTeam].addPlayer(name);
		}

	}

}

Game.prototype.findPlayerByName = function(name){

	var playerGot;
		
	this.forAllPlayers(function(player){

		if(player.name == name) playerGot = player;

	});
	
	return playerGot;
};

Game.prototype.hasPlayer = function(name){

	if(!this.findPlayerByName(name)) return true;
	else return false;
}

module.exports = Game;