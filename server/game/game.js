var oneGame = new Game(60, 62);
var Tree = require('./objects.js').Tree;
var Note = require('./objects.js').Note;
var tools = require('./tools.js');
var Player = require('./player.js')(oneGame);

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function buildGrid(width, height){
	
	var grid = [];
	
	for(var x = 0; x < width; x++){
		grid.push([]);
		for(var y = 0; y < height; y++){
			grid[x].push(new GridNode({x: x, y:y}));
		}
	}

	grid.forEach = function(func){
		for(var x = 0; x < grid.length; x++){
			for(var y = 0; y < grid[x].length; y++){
				func(grid[x][y]);
			}
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
	this.updated = {};

	this.testing = true;

	this.size = {width: width, height: width};
	this.pixels = {width: width * 78, height: height * 78};
	this.teams = {};
		
	this.currentSec = 0;
	
	this.playerCount = 0;
	
	this.started = false;

	this.currentTeamMax = 1;
	
	this.bearX = 22;
	this.bearY = 27;	

	this.packets = [];

	this.tag = "game";

	this.players = {};

	this.powerStats = {};
	
	Object.defineProperty(this, 'grid', {value: buildGrid(width, height), enumerable: false});
	Object.defineProperty(this, 'elephant', {value: {}, enumerable: false});
	Object.defineProperty(this, 'objects', {value: [], enumerable: false});

	this.draw = function(){
		//tiled background
		for(var x = 0; x < ((this.size.width/12.1)); x++){
			for(var y = 0; y < ((this.size.height/10.34)); y++){
				renderer.drawImage("background", x * 944, y * 807);
			}
		}

		for(var x = 0; x < game.saved.grid.length; x++){
			for(var y = 0; y < game.saved.grid[x].length; y++){
				if(game.saved.grid[x][y].contains) game.saved.grid[x][y].contains.draw();
			}
		}
	}
	
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

	this.forAllPlayers(function(player){
		player.update(io);
	});

	var updatedGame = tools.buildUpdated(this);
	console.log(updatedGame);
	//if(Object.keys(updatedGame).length) console.log(updatedGame);
	io.sockets.emit('update_clients', {time: this.currentSec, update: updatedGame});
	
	setTimeout( this.update.bind(this, io) , 60);
	
};

Game.prototype.addUpdate = function(arg){
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
}

Game.prototype.start = function(io){
	io.sockets.emit("startgame_client", {game: this, grid: this.grid, objects: this.objects});
};


Game.prototype.collide = function(agent){
	if(agent.x + agent.width > this.pixels.width || agent.y + agent.height > this.pixels.height || agent.x < 0 || agent.y < 0) return true;
	return false;
}

Game.prototype.collideCheck = function(dummy){
	return !tools.checkAll(dummy, [
		this,
		this.forAllRelevantHardGridObjects.bind(this),
		this.forAllTeams.bind(this),
		this.forAllAlivePlayers.bind(this),
		this.objects,
	]);
}

Game.prototype.forAllGridNodes = function(func){
	var result = false;

	for(var x = 0; x < this.grid.length; x++){
		for(var y = 0; y < this.grid[x].length; y++){
			if(func(this.grid[x][y])) result = true;
		}
	}

	return result;
};

Game.prototype.forAllRelevantHardGridObjects = function(func, coords){

	var result = false;

	var gridX = Math.floor(coords.x/78);
	var gridY = Math.floor(coords.y/78);

	for(var x = gridX; x < (gridX + 2); x++){
		for(var y = gridY; y < (gridY + 2); y++){
			
			node = this.grid[x][y];
			if(node.contains && node.contains.hard){

				if(func(node.contains)) result = true;


			}		
		}
	}

	return result;
};


Game.prototype.forAllHardGridObjects = function(func){
	var result = false;

	for(var x = 0; x < this.grid.length; x++){
		for(var y = 0; y < this.grid[x].length; y++){
			node = this.grid[x][y];
			if(node.contains && node.contains.hard){

				if(func(node.contains)) result = true;


			}
		}
	}

	return result;
};

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
	for(var name in this.players){
		var player = this.players[name];
		if(player.removed) continue;
		if(func(player)) result = true;
	}
	return result;
}

Game.prototype.forAllAlivePlayers = function(func){
	var result = false;

	for(var name in this.players){
		var player = this.players[name];
		if(player.dead) continue;
		if(player.removed) continue;
		if(func(player)) result = true;
	}

	return result;

}

Game.prototype.forAllOtherPlayers = function(playerIn, func){
	var result = false;

	for(var name in this.players){
		var player = this.players[name];
		if(player.dead) continue;
		if(player.removed) continue;
		if(playerIn == player) continue;
		
		if(func(player)) result = true;
	}

	return result;


}

Game.prototype.forAllOtherAlivePlayers = function(playerIn, func){
	var result = false;

	for(var name in this.players){
		var player = this.players[name];
		if(player.dead) continue;
		if(player.removed) continue;
		if(playerIn == player) continue;
		if(func(player)) result = true;
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

Game.prototype.getTeamPlayers = function(team){
	var players = [];
	this.forAllPlayers(function(player){
		if(player.team == team.name) players.push(player);
	});
	return players;
}

Game.prototype.generate = function(){
	
	for(var x = 0; x < this.size.width; x++){
		
		for(var y = 0; y < this.size.height; y++){
			
			if(this.inTerritory("team", {x:x, y: y})){

			}else if( this.inTerritory("boulder", {x:x, y:y}) ){
				
			}else if( this.inTerritory("forest", {x:x, y:y}) ){

				var chance = Math.random() * 100;

				if(chance <= 89){
					this.grid[x][y].contains = new Tree (x, y);
				}
				if(chance > 89 && chance <= 93){
					this.grid[x][y].contains = new Note (x, y);
				}
				
			}else{
				
				var chance = Math.random() * 100;

				if(chance <= 40){
					this.grid[x][y].contains = new Tree (x, y);
				}
				if(chance > 89 && chance <= 91){
					this.grid[x][y].contains = new Note (x, y);
				}
				
				
			}

		}
	}
	
}

Game.prototype.powerStatsUpdate = function(powerIn){

	if(!this.powerStats[powerIn]) this.powerStats[powerIn] = {had: false, total: 0};
	stats = this.powerStats[powerIn];
	stats.had = true;
	stats.total++;
	this.addUpdate("powerStats");

}

Game.prototype.addPlayer = function(name, master){
		
	var allMax = true;
	var aTeam = "";
	
	for(var tName in this.teams){
		
		var tLength = this.teams[tName].playersCount;
		
		//check if all teams are at max
		if(tLength !== this.currentTeamMax) allMax = false;
		else aTeam = tName;
		
		if(tLength < this.currentTeamMax){
			
			newPlayer = new Player({name: name, team: tName, master: master})
			newPlayer.addUpdate("all");
			newPlayer.spawn();
			this.players[name] = newPlayer;
			this.teams[tName].playersCount++;
			this.addUpdate("players");
			return newPlayer;
			
			break;
			
		}
	}
	
	//if all teams are at max
	if(allMax && aTeam != ""){
		
		this.currentTeamMax++;

		newPlayer = new Player({name: name, team: aTeam})
		newPlayer.addUpdate("all");
		newPlayer.spawn();
		this.players[name] = newPlayer;
		this.teams[aTeam].playersCount++;
		this.addUpdate("players");
		return newPlayer;
	}
}

Game.prototype.findPlayerByName = function(nameIn){

	var playerGot;
		
	for(var name in this.players){
		var player = this.players[name];
		if(player.name == nameIn) playerGot = player;
	}

	if(playerGot) return playerGot;
	else return false;
	
};

Game.prototype.hasPlayer = function(name){

	if(!this.findPlayerByName(name)) return false;
	else return true;
}

module.exports = oneGame;