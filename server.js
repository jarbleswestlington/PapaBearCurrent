function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function checkCollision(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;

       }

   }
}

var Game = function(){

	this.teams = {};
	this.check = [];
	this.illegal = [];
	
	this.master = undefined;
	
	this.treeNum = 1;
	this.joined = 0;
	this.playerCount = 0;
	
	this.started = false;

	this.trees = [];
	this.notes = [];
	this.currentTeamMax = 1;


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

Game.playerReturn = function(name){


}

Game.findPlayerByName = function(name){

	return this.forAllPlayers(function(player){

		if(player.name = name) return player;

	})

	return false;
}

Game.hasPlayer = function(name){

	if(!this.findPlayerByName(name)) return true;
	else return false;
}

var Team = function(game, name, coord){
	
	this.score = 0;
	this.name = name;
	this.players = [];
	this.baseX = coord.x;
	this.baseY = coord.y;

	game.teams[name] = this;
};

Team.prototype.addPlayer = function(name){
	
	var newPlayer = new Player({name: name, team: this});
	
	newPlayer.spawn();
	
	this.players.push(newPlayer);
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


module.exports = {game: Game, player: Player, team: Team};