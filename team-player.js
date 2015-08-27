

module.exports = function(game){
	
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

		var newPlayer = new Player({name: name, team: this.name});
		
		newPlayer.spawn();
		
		this.players.push(newPlayer);
	};

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
		
		this.powers = {};

		this.canDisguise = false;
		this.swordBearer = false;
		this.chosenOne = false;
		this.hasPapa = false;
		this.hasSword = false;
		
		this.dead = false;
		
		
		this.chatting = false;
		this.chatText =  "";
		this.illegal = false;
		
		this.weapon = {
			has:false,
			attacking:false,
			hwidth : 30,
			hheight : 5,
			vwidth : 5,
			vheight : 30,
			
			getWidth: function(){
				if (this.direction == "U" || this.direction == "D"){
					return this.weapon.vwidth;
				}else if (this.direction == "L" || this.direction == "R"){
					return this.weapon.hwidth;
				}
			},
			getHeight: function(){
				if (this.direction == "U" || this.direction == "D"){
					return this.weapon.vheight;
				}else if (this.direction == "L" || this.direction == "R"){
					return this.weapon.hheight;
				}
			}
			
		},
		
		this.log = {
			has: false,
			stolen: false,
			stolenFrom: "",
			wood: 0,
		}

	};

	Player.prototype.spawn = function(func){

		var spawnCoords = {};
		var free = true;

		var getXY = function(){

			var spawnX = 0;

			var spawnY = 0;
			
			spawnX = game.teams[this.team].baseX + (100 * Math.random() * 4);

			spawnY = game.teams[this.team].baseY + (100 * Math.random() * 4);

			return {x: spawnX, y: spawnY};
		}.bind(this);

		do{

			free = true;

			var collision = getXY();

			game.forAllOtherPlayers(this, function(player){

				if(game.checkCollision(collision, player, 41, 36, 41, 36, 0, 0)) free = false;

			});
			
			game.forAllTrees(function(tree){
				
				if(game.checkCollision(collision, tree, 41, 36, 78, 78, 0, 0)) free = false;
				
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

			elephant[oPlayer.name].emit("death", {});

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

	return {Team:Team, Player:Player};
};




