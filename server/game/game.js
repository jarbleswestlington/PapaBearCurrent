var Tree = require('./objects.js').Tree;

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
	
}

Game.prototype.start = function(io){
	
	io.sockets.emit("startgame_client", {game: this, trees:this.trees, notes: this.notes, objects: this.objects});

}

Game.prototype.collide = function(dummy){
	var illegal = false;
	
	var check = function(){
		
		if(dummy.x > this.pixels.width || dummy.y > this.pixels.height || dummy.x < 0 || dummy.y < 0){
			
			illegal = true;
			return true;
		}
		
		this.forAllTeams(function(team){
			
			var boxes = team.baseColBoxes;
			
			boxes.forEach(function(box){
				
				if(this.colCheckRelative(dummy, {item: box, influencer: {x: team.baseX, y: team.baseY} } )) illegal = true;
				
			}.bind(this));
		}.bind(this));
		
		this.forAllAlivePlayers(function(oPlayer){
			
			if(!illegal && this.colCheck(dummy, oPlayer)) illegal = true;
	
		}.bind(this));
		
		for(i = 0; i < this.trees.length; i++){
	
			if(this.trees[i].removed == false){
			
				if(this.colCheck(dummy, this.trees[i])){

					illegal = true;
					return true;
				}
			}
	
		}
		
		for(i = 0; i < this.objects.length; i++){
	
			if(!this.objects[i].removed && this.objects[i].hard){
			
				if(this.colCheck(this.objects[i], dummy)){

					illegal = true;
					return true;
				}
			}
	
		}
		
	
	}.bind(this);
	
	check();

	if(illegal) return true;
	else return false;	
}

Game.prototype.colCheck = function(smaller, bigger, padding){
	
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
		
	if( (smaller.x >= bigger.x + padding.x && smaller.x <= bigger.x + bigger.width - padding.x) || (smaller.x + smaller.width >= bigger.x + padding.x && smaller.x + smaller.width <= bigger.x + bigger.width - padding.x) ){

       if( (smaller.y >= bigger.y + padding.y && smaller.y <= bigger.y + bigger.height - padding.y) || (smaller.y + smaller.height >= bigger.y + padding.y && smaller.y + smaller.height <= bigger.y + bigger.height - padding.y) ){

           return true;
       }

   }
	
}

Game.prototype.colCheckRelative = function(smallerGroup, biggerGroup, padding){
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
	
	if(biggerGroup.item) biggerGroup = {x: biggerGroup.item.x + biggerGroup.influencer.x, y: biggerGroup.item.y + biggerGroup.influencer.y, width: biggerGroup.item.width, height: biggerGroup.item.height};

	if(smallerGroup.item) smallerGroup = {x: smallerGroup.item.x + smallerGroup.influencer.x, y: smallerGroup.item.y + smallerGroup.influencer.y, width: smallerGroup.item.width, height: smallerGroup.item.height};

	return this.colCheck(smallerGroup, biggerGroup, padding);
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

Game.prototype.forAllAlivePlayers = function(func){
	
	for(var name in this.teams){
		for(var i = 0; i < this.teams[name].players.length; i++){

			if(!this.teams[name].players[i].dead) func(this.teams[name].players[i]);
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
					this.notes.push({x: x * 78, y: y * 78, removed: false});
				}
				
			}else{
				
				var chance = Math.random() * 100;

				if(chance <= 40){
					this.trees.push({x: x * 78, y: y * 78, width:78, height:78, removed: false, treeNum : getRandomInt(1,4)});
				}
				if(chance > 89 && chance <= 91){
					this.notes.push({x: x * 78, y: y * 78, removed: false});
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