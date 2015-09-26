var Tree = require('./objects.js').Tree;
var Note = require('./objects.js').Note;
var tools = require('./tools.js');


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function buildGrid(width, height){
	
	var grid = [];
	
	for(var x = 0; x < width; x++){
		grid.push([]);
		for(var y = 0; y < width; y++){
			grid[x].push(new GridNode({x: x, y:y}));
		}
	}
	
	return grid;
}

function GridNode(data){
		
	this.x = data.x || null;
	this.y = data.y || null;
	this.coords = {x: data.x * 78, y: data.y * 78};
	this.width = 78;
	this.height = 78;
	this.territory = data.territory || "";
	this.collidable = data.collidable || false;
	this.contains = data.contains || null;
	this.teleports = data.teleports || false;
	this.teleportTo = data.teleportTo || null;
	this.spriteRef = data.spriteRef || null;
	
}

function Game(width, height){
	
	this.size = {width: width, height: width};
	this.pixels = {width: width * 78, height: height * 78};
	this.teams = {};
		
	this.currentSec = 0;
	
	this.playerCount = 0;
	
	this.started = false;

	this.currentTeamMax = 1;
	
	this.bearX = 22;
	this.bearY = 27;	

	this.tag = "game";

	this.draw = function(){
		//tiled background
		for(var x = 0; x < ((this.size.width/12.1)); x++){
		
			for(var y = 0; y < ((this.size.height/10.34)); y++){
				renderer.drawImage("background", x * 944, y * 807);

			}
		}
	}
		
	Object.defineProperty(this, 'grid', {value: buildGrid(width, height), enumerable: false});
	Object.defineProperty(this, 'elephant', {value: {}, enumerable: false});
	Object.defineProperty(this, 'trees', {value: [], enumerable: false});
	Object.defineProperty(this, 'notes', {value: [], enumerable: false});
	Object.defineProperty(this, 'objects', {value: [], enumerable: false});
	
};

Game.prototype.addNode = function(data){
	
	this.grid[data.x][data.y] = new GridNode(data);
	
}

Game.prototype.updateNode = function(data){
	
	var node = this.grid[data.x][data.y];
	
	for(var prop in data){
		if(data.hasOwnProperty(prop)){
			node[prop] = data[prop];
		}
		
	}
	
}

Game.prototype.update = function(io) {
			
	var now = new Date().getTime() / 1000;
	this.currentSec = Math.floor(now - this.startsecond);

	io.sockets.emit('update_clients', {game: this, time: this.currentSec});
	
	setTimeout( this.update.bind(this, io) , 50);
	
};

Game.prototype.start = function(io){
	io.sockets.emit("startgame_client", {game: this, trees:this.trees, notes: this.notes, objects: this.objects});
};


Game.prototype.collide = function(agent){
	if(agent.x > this.pixels.width || agent.y > this.pixels.height || agent.x < 0 || agent.y < 0) return true;
	return false;
}

Game.prototype.collideCheck = function(dummy){
	return !tools.checkAll(dummy, [
		this,
		this.forAllTeams.bind(this),
		this.forAllAlivePlayers.bind(this),
		this.trees,
		this.objects,
	]);
}

Game.prototype.forAllTeams = function(func){
	var result = false;

	for(var name in this.teams){
		if(func(this.teams[name])) result = true;
	}
	return result;
}

Game.prototype.forAllTrees = function(func){
	var result = false;

	for(var i = 0; i < game.trees.length; i++){
		if(game.trees[i].removed) continue;
		if(func(game.trees[i])) result = true;
	}
	return result;

}

Game.prototype.forAllPlayers = function(func){
	var result = false;
	for(var name in this.teams){
		for(var i = 0; i < this.teams[name].players.length; i++){
			if(func(this.teams[name].players[i])) result = true;
		}
	}
	return result;
}

Game.prototype.forAllAlivePlayers = function(func){
	var result = false;

	for(var name in this.teams){
		for(var i = 0; i < this.teams[name].players.length; i++){
			if(this.teams[name].players[i].dead) return;
			if(func(this.teams[name].players[i])){
				result = true;
			} 
			
		}
	}

	return result;

}

Game.prototype.forAllOtherPlayers = function(player, func){
	var result = false;

	for(var name in this.teams){

		for(var i = 0; i < this.teams[name].players.length; i++){

			if(player !== this.teams[name].players[i]){
				if(func(this.teams[name].players[i])) return true;
			} 
		}
	}

	return result;


}

Game.prototype.forAllOtherAlivePlayers = function(player, func){
	var result = false;

	for(var name in this.teams){

		for(var i = 0; i < this.teams[name].players.length; i++){
			if(player !== this.teams[name].players[i] && !this.teams[name].players[i].dead){
				if(func(this.teams[name].players[i])) result = true;
			}
		}
	}
	return result;

}

Game.prototype.inTerritory = function(type, obj){

	if(this.grid[obj.x][obj.y].territory == type) return true;
	else return false;
}

Game.prototype.defineTerritory = function(type, coords){
	for(var x = coords.x; x < coords.x+coords.width; x++){
		for(var y = coords.y; y < coords.y+coords.height; y++){
			if(this.grid[x][y]) this.updateNode({x:x, y:y, territory: type});
			else this.addNode({x:x, y:y, territory: type});
		}
	}
}

Game.prototype.spawnNotesAndTrees = function(){
	
	for(var x = 0; x < this.size.width; x++){
		
		for(var y = 0; y < this.size.height; y++){
			
			if(this.inTerritory("team", {x:x, y: y})){
				
			}else if( this.inTerritory("forest", {x:x, y:y}) ){

				var chance = Math.random() * 100;

				if(chance <= 89){
					this.trees.push(new Tree (x, y));
				}
				if(chance > 89 && chance <= 93){
					this.notes.push(new Note (x, y));
				}
				
			}else{
				
				var chance = Math.random() * 100;

				if(chance <= 40){
					this.trees.push(new Tree (x, y));
				}
				if(chance > 89 && chance <= 91){
					this.notes.push(new Note (x, y));
				}
				
				
			}

		}
	}
	
}

Game.prototype.addPlayer = function(name, master){
		
	if(master) return;
		
	var allMax = true;
	var aTeam = "";
	
	for(var tName in this.teams){
		
		var tLength = this.teams[tName].players.length;
		
		//check if all teams are at max
		if(tLength !== this.currentTeamMax) allMax = false;
		else aTeam = tName;
		
		if(tLength < this.currentTeamMax){
			
			return this.teams[tName].addPlayer(name);
			
			break;
			
		}
	}
	
	//if all teams are at max
	if(allMax && aTeam != ""){
		
		this.currentTeamMax++;
		
		return this.teams[aTeam].addPlayer(name);
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