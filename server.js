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
};

Game.prototype.update(io) {
			
	var now = new Date().getTime() / 1000;
	game.currentSec = Math.floor(now - startsecond);

	io.sockets.emit('update_clients', {game: game, time: game.currentSec});

	process.nextTick(function(){ game.update(io) } );
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
		
		var joiningPlayer = {name: name, team: this};

		joiningPlayer.team = this;
		
		this.master = new Player(joiningPlayer);

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

	return this.forAllPlayers(function(player){

		if(player.name = name) return player;

	})

	return false;
}

Game.prototype.hasPlayer = function(name){

	if(!this.findPlayerByName(name)) return true;
	else return false;
}

var Team = function(game, name, coord){
	
	this.score = 0;
	this.name = name;
	this.players = [];
	this.baseX = coord.x;
	this.baseY = coord.y;
	this.base = coord;

	game.teams[name] = this;
};

Team.prototype.addPlayer = function(name){
	
	var newPlayer = new Player({name: name, team: this});
	
	newPlayer.spawn();
	
	this.players.push(newPlayer);
}

var Weapon (owner, horiz, vertic){
	
	this.owner = owner;
	this.hwidth = horiz.width,
	this.hheight = horiz.height,
	this.vwidth = vertic.width,
	this.vheight = vertic.height,
	
	this.getWidth = function(){
		if (this.owner.direction == "U" || this.owner.direction == "D"){
			return this.vwidth;
		}else if (this.owner.direction == "L" || this.owner.direction == "R"){
			return this.hwidth;
		}
	},
	this.getHeight: function(){
		if (this.owner.direction == "U" || this.owner.direction == "D"){
			return this.vheight;
		}else if (this.owner.direction == "L" || this.owner.direction == "R"){
			return this.hheight;
		}
	}
	
}

Weapon.prototype.toPower(){
	
	this.hwidth = 45;
	this.hheight = 7;
	this.vwidth = 7;
	this.vheight = 45;
}


var Player = function(args){
	
	this.x = 0;
	this.y = 0;
	this.team = args.team;
	this.renderteam = args.team;
	this.name = args.name;
	this.direction = "D";
	
	this.attacking = false;
	this.slashing = false;
	this.character = Math.floor((Math.random() * 3) + 1);
	
	this.canDisguise = false;
	this.swordBearer = false;
	this.chosenOne = false;
	this.PAPABEAR = false;
	
	this.dead = false;
	
	this.chatting = false;
	this.chatText =  "";
	this.illegal = false;
	
	this.weapon = new Weapon(this, {width:30, height:5}, {width:5, height:30});

};




Player.prototype.spawn = function(func){

	var spawnCoords = {};
	var free = true;

	function getXY(){

		var spawnX = 0;

		var spawnY = 0;

		if (this.team.name == "blue") {

			spawnX = 1300 + (100 * Math.random() * 4);

			spawnY = 1300 + (100 * Math.random() * 4);

		}else if (this.team.name == "red") {

			spawnX = 3400 - (100 * Math.random() * 4);

			spawnY = 2300 + (100 * Math.random() * 4);

		}else if (this.team.name == "green") {

			spawnX = 1300 + (100 * Math.random() * 4);

			spawnY = 3400 - (100 * Math.random() * 4); 

		}

		return {x: spawnX, y: spawnY};
	}


	do{

		free = true;

		var collision = getXY();

		game.forAllOtherPlayers(this, function(player){

			if(player !== this){

				if(checkCollision(collision, player, 41, 36, 41, 36, 0, 0)){
				
					free = false;
		
				}

			}

		});
		
	}while(!free);

	if(!func){

		this.x = collision.x;
		this.y = collision.y;

	}else{

		func(collision);
	}

}

Player.prototype.checkCollisions = function(dummy){
	
	var illegal = false;
	
	if(!this.PAPABEAR){
	
		game.forAllOtherAlivePlayers(this, function(oPlayer){
					
   			if(!oPlayer.PAPABEAR && game.checkCollision(dummy, oPlayer, 41, 36, 41, 36, 0, 0)){
			
   				illegal = true;
					
			}
			
		});
	
	}
		
   	for(i = 0; i < game.trees.length; i++){
		
		if(game.trees[i].removed == false){
		
			if(this.PAPABEAR){
			
				if(game.checkCollision(dummy, game.trees[i], 63, 63, 78, 78, 0, 0)){
		
					illegal = true;
			
				}
		
			}else{
			
				if(game.checkCollision(dummy, game.trees[i], 41, 36, 78, 78, 0, 0)){
		
					illegal = true;
			
				}
			}
		
		}
		
   	}
	
   	if(!illegal){
		
		this.x = dummy.x;
		this.y = dummy.y;
		
   	}
	
	
}



Player.prototype.checkHits = function(){
	
	var hit = false;
	
	game.forAllOtherAlivePlayers(this, function(oPlayer){

		if(this.PAPABEAR){
						
			if(game.checkCollision(oPlayers, this, 41, 36, 63, 63, 0, 0)) hit = true;

		}
		
		if(this.attacking){
			
			var directions = {
				U:{x: 36,y: -22},
				D:{x:0,y:20},
				R:{x:36,y:22},
				L:{x:-26,y:+22}
			}
			
			if(game.checkCollision({x: this.x + directions[this.direction].x, y: this.y + directions[this.direction].x}, oPlayer, this.weapon.getWidth(), this.weapon.getHeight(), oPlayer.PAPABEAR ? 41 + game.bearX : 41, oPlayer.PAPABEAR ? 36 + game.bearX : 36, 0, 0)) hit = true;
	
		}		
		
		if(hit){
	
			oPlayer.dead = true;	

			oPlayer.spawn(function(spawn){

				setTimeout(function() { 
					oPlayer.x = spawn.x;
					oPlayer.y = spawn.y;
					oPlayer.dead = false;
					oPlayer.PAPABEAR = false;
					
				 }, 8000);

			});
		
		}
		
	}.bind(this));

}



module.exports = {game: Game, player: Player, team: Team};