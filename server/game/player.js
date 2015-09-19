module.exports = function(game){
	
	var Player = function(args){
	
		this.x = 0;
		this.y = 0;
		this.height = 41;
		this.width = 36;
		this.team = args.team;
		this.renderteam = args.team;
		this.name = args.name;
		this.direction = "D";
	
		this.attacking = false;
		
		this.character = Math.floor((Math.random() * 3) + 1);
	
		this.powers = {};

		this.frozen = false;
	
		this.dead = false;
	
		this.chatting = false;
		this.chatText =  "";
		this.illegal = false;
	
		this.spear = {
			has:false,
			attacking:false,
			hwidth : 30,
			hheight : 5,
			vwidth : 5,
			vheight : 30,

			getWidth: function(){
				if (this.direction == "U" || this.direction == "D"){
					return this.spear.vwidth;
				}else if (this.direction == "L" || this.direction == "R"){
					return this.spear.hwidth;
				}
			},
			getHeight: function(){
				if (this.direction == "U" || this.direction == "D"){
					return this.spear.vheight;
				}else if (this.direction == "L" || this.direction == "R"){
					return this.spear.hheight;
				}
			}

		},
		
		
		this.weapon = {
		    state: "ready"
		}
	
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

			illegal = false;

			var spawnLoc = getXY();

			illegal = this.checkCollisions(spawnLoc);
		
		}while(illegal);

		if(!func){

			this.x = spawnLoc.x;
			this.y = spawnLoc.y;

		}else{

			func(collision);
		}

	}

	Player.prototype.checkCollisions = function(dummy){

		var illegal = false;
		
		var check = function(){
			
			if(dummy.x > game.pixels.width || dummy.y > game.pixels.height || dummy.x < 0 || dummy.y < 0){
				
				illegal = true;
				return true;
			} 
			
			game.forAllTeams(function(team){
				
				var boxes = team.baseColBoxes;
				
				boxes.forEach(function(box){
					
					if(game.colCheckRelative(dummy, {item: box, influencer: {x: team.baseX, y: team.baseY} } )) illegal = true;
					
				}.bind(this));
			}.bind(this));
			
			if(!this.powers.papaBear){
	
				game.forAllOtherAlivePlayers(this, function(oPlayer){
					
					if(!illegal && !oPlayer.powers.papaBear && game.checkCollision(dummy, oPlayer, 41, 36, 41, 36, 0, 0)){
			
						illegal = true;
					
					}
			
				});
	
			}
					
			for(i = 0; i < game.trees.length; i++){
		
				if(game.trees[i].removed == false){
		
					if(this.powers.papaBear){
			
						if(game.checkCollision(dummy, game.trees[i], 63, 63, 78, 78, 0, 0)){
		
							illegal = true;
							return true;
			
						}
		
					}else{
			
						if(game.checkCollision(dummy, game.trees[i], 41, 36, 78, 78, 0, 0)){
		
							illegal = true;
							return true;
			
						}
					}
		
				}
		
			}
		
		}.bind(this);
		
		check();
	
		if(illegal) return true;
		else return false;	
	}
	
	Player.prototype.die = function(){
		
		this.dead = true;
		 

		this.spawn(function(spawn){

			setTimeout(function() { 
				this.x = spawn.x;
				this.y = spawn.y;
				this.dead = false;
				this.powers.papaBear = false;
		
			 }.bind(this), 8000);

		}.bind(this));
	}

	Player.prototype.checkHits = function(){
	
		game.forAllOtherAlivePlayers(this, function(oPlayer){
	
			var hit = false;

			if(this.powers.papaBear){
					
				if(game.checkCollision(oPlayer, this, 41, 36, 63, 63, 0, 0)) hit = true;

			}
	
			if(this.attacking){
		
				var directions = {
					U:{x: 36,y: -22, width:5, height:30},
					D:{x:0,y:20, width: 5, height:30},
					R:{x:36,y:22, width: 30, height:5},
					L:{x:-26,y:+22, width: 30, height:5}
				}
		
				if(game.colCheckRelative({item: directions[this.direction], influencer: this}, oPlayer, {x:0, y:0})) hit = true;
			}		
	
			if(hit){
        		
				console.log(this.name + "killed" + oPlayer.name);

				game.elephant[oPlayer.name].emit("death", {});
				oPlayer.die();
	
			}
	
		}.bind(this));
	
	}
	
	Player.prototype.swipe = function(){
		
		game.forAllOtherAlivePlayers(this, function(oPlayer){
					
		    var boxes = this.weaponColBoxes[this.direction];

		    boxes.forEach(function(box){
				
		        if(game.colCheckRelative({item: box, influencer: this}, oPlayer, {x:0, y:0})){
            		console.log(this.name + "killed" + oPlayer.name);
					
		            game.elephant[oPlayer.name].emit("death", {});
					oPlayer.die();
		        }

			}.bind(this));

		}.bind(this));	
	};
		
	Player.prototype.weaponColBoxes = {

	     "U": [{
	        x:  - 14.5, y: - 30,
	        width: 70, height: 50
	     }, {
	        x:  - 33.5, y:  -9,
	        width: 19,height: 29
	     }, {
	        x:  - 7, y:  -35,
	        width: 9, height: 5
	     }, {
	        x:   2, y:  - 35,
	        width: 35,height: 9
	     }, {
	        x:   53, y:  - 35,
	        width: 9,height: 5
	     }, {
	        x:   54, y:  - 9,
	        width: 19,height: 29
	    }], 
            
            
	    "D": [{
	        x: - 14.5, y: 20,
	        width: 70,height: 50
	     }, {
	        x: - 33.5, y:  20,
	        width: 19,height: 29
	     }, {
	        x: - 7, y:  70,
	        width: 9,height: 5
	     }, {
	        x:  2, y: 70,
	        width: 35,height: 9
	     }, {
	        x: 53, y: 70,
	        width: 9,height: 5
	     }, {
	        x: 54, y: 20,
	        width: 19,height: 29
	    }], 
        
        
	     "L": [{
	        x: - 30, y: - 18,
	        width: 50, height: 70
	     }, {
	        x: - 9, y: 53,
	        width: 29,height: 19
	     }, {
	        x: - 35, y: -35,
	        width: 5, height: 9
	     }, {
	        x: -35, y:  0 ,
	        width: 9,height: 35
	     }, {
	        x:  - 35, y: - 9,
	        width: 5,height: 9
	     }, {
	        x: - 9, y: - 37,
	        width: 29,height: 19
	    }], 
        
	     "R": [{
	        x: 20, y: - 18,
	        width: 50, height: 70
	     }, {
	        x: 20, y: 53,
	        width: 29,height: 19
	     }, {
	        x: 70, y: -35,
	        width: 5, height: 9
	     }, {
	        x: 70, y: 0,
	        width: 9,height: 35
	     }, {
	        x: 70, y: - 9,
	        width: 5,height: 9
	     }, {
	        x: 20, y: - 37,
	        width: 29,height: 19
	    }]
	};

	return Player;
	
}
