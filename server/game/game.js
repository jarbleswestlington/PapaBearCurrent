function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

var Team = require('./team.js')(null);

var Game = function(x, y){
	
	this.size = {x: x, y: y};
	
	this.teams = {};
	this.check = [];
	this.illegal = [];
	
	this.master = undefined;
	
	this.currentSec = 0;
	
	this.joined = 0;
	this.playerCount = 0;
	
	this.started = false;

	this.currentTeamMax = 1;
	
	this.bearX = 22;
	this.bearY = 27;
	this.sockets = {};
	
	Object.defineProperty(this, 'elephant', {value: {}, enumerable: false});
	Object.defineProperty(this, 'trees', {value: [], enumerable: false});
	Object.defineProperty(this, 'notes', {value: [], enumerable: false});

};

Game.prototype.update = function(io) {
			
	var now = new Date().getTime() / 1000;
	this.currentSec = Math.floor(now - this.startsecond);

	io.sockets.emit('update_clients', {game: this, time: this.currentSec});
	
	setTimeout( this.update.bind(this, io) , 50);
	
}

Game.prototype.start = function(io){
	
	io.sockets.emit("startgame_client", {game: this, trees:this.trees, notes: this.notes});

}

Game.prototype.colCheck = function(smaller, bigger, padding){
	
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
	
	if( (smaller.x >= bigger.x + padding.x && smaller.x <= bigger.x + bigger.width - padding.x) || (smaller.x + smaller.width >= bigger.x + padding.x && smaller.x + smaller.width <= bigger.x + bigger.width - padding.x) ){

       if( (smaller.y >= bigger.y + padding.y && smaller.y <= bigger.y + bigger.height - padding.y) || (smaller.y + smaller.height >= bigger.y + padding.y && smaller.y + smaller.height <= bigger.y + bigger.height - padding.y) ){

           return true;
       }

   }
	
}

Game.prototype.colCheckRelative = function(smallerGroup, bigger, padding){
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};

	var smaller = {x: smallerGroup.item.x + smallerGroup.influencer.x, y: smallerGroup.item.y + smallerGroup.influencer.y, width: smallerGroup.item.width, height: smallerGroup.item.height};

	return this.colCheck(smaller, bigger, padding);
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

Game.prototype.inTerritory = function(obj){
	
	var illegal = false;
	
	this.forAllTeams(function(team){

		if(this.colCheck(obj, team)){
			console.log("collided");
			illegal = true;
		} 
		
	}.bind(this));
	
	return illegal;
}

Game.prototype.spawnNotesAndTrees = function(){
	
	for(var x = 0; x < this.size.x; x++){
		
		for(var y = 0; y < this.size.y; y++){
			
			if(!this.inTerritory({x:x, y: y, width:1, height:1})){

				var chance = Math.random() * 100;
			
				if(chance <= 65){
				
					this.trees.push({x: x * 78, y: y * 78, removed: false, treeNum : getRandomInt(1,4)});
				
				}
				if(chance > 65 && chance <= 68){
				
					this.notes.push({x: x * 78, y: y * 78, removed: false});
				
				}
			
			}
//			 if(y > 14 && x > 14 && y < 46 && x < 46){
//
// 				if(y > 14 && x > 19 && y < 24 && x < 46){
//
// 						var chance = Math.random() * 100;
//
// 						if(chance <= 40){
//
// 							this.trees.push({x: x * 78, y: y * 78, removed: false, treeNum : getRandomInt(1,4)});
//
//
// 						}
// 						if(chance > 89 && chance <= 90){
//
// 							this.notes.push({x: x * 78, y: y * 78, removed: false});
// 						}
//
// 				}else if (y > 23 && x > 14 && y < 38 && x < 41) {
//
// 						var chance = Math.random() * 100;
//
// 						if(chance <= 40){
//
// 							this.trees.push({x: x * 78, y: y * 78, removed: false, treeNum : getRandomInt(1,4)});
//
//
// 						}
// 						if(chance > 89 && chance <= 90){
//
// 							this.notes.push({x: x * 78, y: y * 78, removed: false});
// 						}
//
// 				}else if (y > 37 && x > 19 && y < 46 && x < 46) {
//
// 						var chance = Math.random() * 100;
//
// 						if(chance <= 40){
//
// 							this.trees.push({x: x * 78, y: y * 78, removed: false, treeNum : getRandomInt(1,4)});
//
//
// 						}
// 						if(chance > 89 && chance <= 90){
//
// 							this.notes.push({x: x * 78, y: y * 78, removed: false});
// 						}
//
// 				}
//
			//}
		}
	}
	
}

Game.prototype.addTeam = function(name, coords){
	
	
	this.teams[name] = new Team(name, coords);
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
	
	if(playerGot) return playerGot;
	else return false;
	
};

Game.prototype.hasPlayer = function(name){

	if(!this.findPlayerByName(name)) return false;
	else return true;
}

module.exports = new Game(60, 60);