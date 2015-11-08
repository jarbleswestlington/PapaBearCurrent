var tools = require('./tools.js');
var powers = require('./powers.js').powers;
var sockets = require("./sockets.js").access;
var Obj = require('./objects.js').Obj;

module.exports = function(game){
	
	function Player(args){
		this.updated = {};

		this.team = args.team;
		this.name = args.name;

		this.freeCamera = false;

		this.willRespawn = false;

		this.x = 0;
		this.y = 0;
		this.height = 36;
		this.width = 41;
		this.direction = "D";

		this.dummy = {x: this.x, y: this.y, height: this.height, width: this.width};

		if(args.master) this.master = true;

		this.renderteam = args.team;

		this.log = {
			has: false,
			stolen: false,
			stolenFrom: "",
			wood: 0,
		}
		this.frozen = false;
		this.dead = false;

		this.chatting = false;
		this.chatText =  "";

		this.render = true;
		this.attacking = false;
		this.powers = {};
		this.tag = "player";

		this.removed = false;
		this.spear = {
			width : 30,
			height : 5,
			image:"spear",
		},
		this.weapon = {
		   state: "ready"
		}

		//this.image = args.image || null;
		this.character = Math.floor((Math.random() * 3) + 1);
		this.draw = function(){
			if(this.dead) renderer.drawImage(this.team + "corpse", this.x- 4, this.y);
			else if(this.powers.papaBear){
				renderer.drawImage("playershadow", this.x-1 , this.y+ 21);
				var papaSpriteFinder= {
					"R":{x:0, y:0, width:63, height:63},
					"D":{x:0, y:66, width:63, height:63},
					"L":{x:66, y:0, width:63, height:63},
					"U":{x:66, y:66, width:63, height:63},
				}
				renderer.drawSprite("bear", this.x,this.y, papaSpriteFinder[this.direction]);
			}else if(this.render){
				renderer.drawImage("playershadow", this.x-1 , this.y+ 21);
				var playerSpriteFinder = {
					"L":{x:2 + ((this.character-1) * 43), y:2, width:41, height:36},
					"R":{x:2 + ((this.character-1) * 43), y:40, width:41, height:33},
					"D":{x:2 + ((this.character-1) * 43), y:75, width:41, height:35},
					"U":{x:2 + ((this.character-1) * 43), y:113, width:41, height:36},
				}
				renderer.drawSprite(this.renderteam + "team", this.x,this.y, playerSpriteFinder[this.direction]);
			}
			if(!this.dead && !this.powers.papaBear){
				if(this.log.has){
					var backpackSpriteFinder = {
						"R":{x:0, y:0, width:60, height:40, thisDelta:{x: -14, y:-3}},
						"D":{x:0, y:40, width:60, height:43, thisDelta:{x: -20, y:-10}},
						"U":{x:0, y:83, width:60, height:39, thisDelta:{x: -20, y:-5}},
						"L":{x:0, y:126, width:60, height:40, thisDelta:{x: 0, y:-3}},	
					}
					renderer.drawSprite("backpacks", this.x + backpackSpriteFinder[this.direction].thisDelta.x, this.y + backpackSpriteFinder[this.direction].thisDelta.y, backpackSpriteFinder[this.direction]);
				}
				if (this.attacking){
					var spearHelper = {
						"U":{x: 36, y: -22},
						"D":{x:0, y: 20},
						"R":{x:36, y:22},
						"L":{x:-26, y:22},
					}			
					renderer.drawImage(this.spear.image + this.direction, this.x + spearHelper[this.direction].x, this.y + spearHelper[this.direction].y);	
				}	
			
			}	
		
		    var weapon = user.client.weapon;
			if(this.weapon.state == "attacking") weapon.renderData.drawBlur(this, weapon.renderData.blur[this.direction]);
		    if(weapon.renderData[this.weapon.state]) renderer.drawImageRelative(weapon.renderData[this.weapon.state][this.direction], this);
			//chat drawing
			if(this.chatting) renderer.playerText(this);
		}

	};


	//random code for gary
	// var chance = Math.floor(Math.random() * 100);

	// var probability = 1;
	// if(chance < 50){
	// 		io.sockets.emit('play_sound', {sound: "step1", coords: {x:this.x, y: this.y}, level: 15} );
	// }else{
	// 		io.sockets.emit('play_sound', {sound: "step2", coords: {x:this.x, y: this.y}, level: 15} );
	// }

	function walkEffects(io){

		//footsteps
		var soundToPlay = "step1";
		if(this.stepToggle){
			this.stepToggle = false;
			soundToPlay = "step2";
		}else this.stepToggle = true;

		io.sockets.emit('play_sound', {sound: soundToPlay, coords: {x:this.x, y: this.y}, level: 15} );

		//footprints
		var coords = this.getFootCoordinates();

		var obj = {type: "footprint", img: "footprint", tag: "footprint", hard: false, x: coords.x, y: coords.y};
		var newObj = new Obj(obj)
		game.objects.push(newObj);
		var index = game.objects.length-1;

		io.sockets.emit('add_object', newObj);

		setTimeout(function(){
			io.sockets.emit('remove_object', {index: index});

		}, 15000)

	};

	Player.prototype.walkEffects = tools.bounce(walkEffects, 250, true);


	Player.prototype.collide = function(agent){
		//agent == thing moving
		//this == thing being hit

		//passive
		//for THIS running into AGENT
		if(agent.tag == "player" || agent.tag == "papaBear"){
			if(this.attacking){
				if(agent.tag == "papaBear" && !this.powers.powerWeapon) return;
				if(tools.colCheckRelative({item: this.spearColBoxes[this.direction], influencer: this}, agent)){
					if(agent instanceof Player) agent.die(this);
					return;
				} 
			}
			if(this.powers.papaBear && tools.colCheck(agent, this)){
				if(agent instanceof Player) agent.die(this);
				return;
			}	
		}

		//active
		//for the AGENT running into THIS -- return true if it collided plz
		if(tools.colCheck(agent, this)){
			if(this.powers.papaBear){
				if(agent.tag == "powerWeapon"){
					if(this instanceof Player) this.die(agent);
				}
				if(agent.tag == "wall"){
					return true;
				}
				return false;
			}
			if(agent.tag == "sword" || agent.tag == "spear" || agent.tag == "powerWeapon" || agent.tag == "papaBear"){
				if(this instanceof Player) this.die(agent);
				return;
			}
			//returns true to prevent movement of the agent
			return true;
		}
	}
	
	Player.prototype.spearColBoxes = {
		U:{x: 36,y: -22, width:6, height:30},
		D:{x:0,y:20, width: 6, height:30},
		R:{x:36,y:22, width: 30, height:6},
		L:{x:-26,y:+22, width: 30, height:6}
	};

	Player.prototype.update = function(io){

		if(this.x == this.dummy.x && this.y == this.dummy.y) return;
		if(this.legalMove(this.dummy)){
			this.walkEffects(io);
			this.x = this.dummy.x;
			this.y = this.dummy.y;
			this.addUpdate("x", "y");
		}else{
			this.dummy.x = this.x;
			this.dummy.y = this.y;
		}

		this.defense();
		this.offense();
	}

	Player.prototype.spawn = function(func){

		var spawnCoords = {};
		var free = true;

		var getXY = function(){

			var spawnX = 0;

			var spawnY = 0;
		
			spawnX = game.teams[this.team].baseX + ((100 * Math.random() * 8) - 400);

			spawnY = game.teams[this.team].baseY + (100 * Math.random() * 3) + 100;

			return {x: spawnX, y: spawnY};
		
		}.bind(this);

		do{

			legal = false;

			var spawnPlayer = getXY();
			spawnPlayer.width = this.width;
			spawnPlayer.height = this.height;

			legal = this.legalMove(spawnPlayer);
		
		}while(!legal);

		if(!func){

			this.getAllDefaultPowers();

			this.x = spawnPlayer.x;
			this.y = spawnPlayer.y;
			this.addUpdate("x", "y");

		}else{

			func(spawnPlayer);
		}

	}

	Player.prototype.getAllDefaultPowers = function(){

		for(var power in powers.index){
			if(powers.index[power].default){
				powers.index[power].giveTo(this);
			}
		}
	};

	Player.prototype.addUpdate = function(arg){
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
		game.addUpdate("players");
	}

	Player.prototype.legalMove = function(dummy){

		dummy.tag = this.tag;
		dummy.name = this.name;

		var playerCollisions = [
			game,
			game.forAllRelevantHardGridObjects.bind(game),
			game.forAllTeams.bind(game),
			game.objects,
			game.forAllOtherAlivePlayers.bind(game, this)
		];

		return tools.checkAll(dummy, playerCollisions);

	}

	Player.prototype.defense = function(){
		//collide with everyone elses spear/papabear
		//this is the passive death
		//you will recognize how this behaves by the top portion of the collisions statements
		var playerCollisions = [
			game.forAllOtherAlivePlayers.bind(game, this)
		];

		return tools.checkAll(this, playerCollisions);

	}

	Player.prototype.offense = function(){

		//if the spear is out, consistently attack with it
		if(!this.attacking || !this.powers.spear) return;

		var box = JSON.parse(JSON.stringify(this.spearColBoxes[this.direction]));

		box.x += this.x;
		box.y += this.y;
		box.name = this.name;
		if(this.powers.powerWeapon) box.tag = "powerWeapon";
		else box.tag = "spear";
		
		tools.checkAll(box, game.forAllOtherAlivePlayers.bind(game, this));
	}
	
	Player.prototype.die = function(killer){
		
		game.elephant[this.name].emit("death", {killer: killer.name});
		game.elephant[killer.name].emit("kill", {reactant: this.name});

		this.dead = true;
		this.attacking = false;		
		this.renderteam = this.team;
		this.log.has = false;
		
		this.loseAllPowers();

		this.addUpdate("dead", "attacking", "renderteam", "log");

		var team = game.teams[this.team];

		var respawn = function(){

			this.spawn(function(spawn){
				setTimeout(function() { 
					this.x = spawn.x;
					this.y = spawn.y;
					this.dead = false;
					this.addUpdate("x", "y", "dead");
				}.bind(this), 8000);
			}.bind(this));

		}.bind(this);

		var check = function(){

			if(team.score >= 250){
				team.score = team.score - 250;
				team.addUpdate("score");
				this.willRespawn = true;
				this.addUpdate("willRespawn");
				respawn();
			}else{
				this.willRespawn = false;
				this.addUpdate("willRespawn");
				setTimeout(check, 1000);
			}
		}.bind(this);

		check();
	}
	
	Player.prototype.loseAllPowers = function(){
		for(var name in this.powers){
			if(this.powers[name] && powers.index[name].include && powers.index[name].include.length){
				powers.index[name].lose(this, false);
			}
		}
		for(var name in this.powers){
			if(this.powers[name]) {
				powers.index[name].lose(this, false);
			}
		}
	}
	
	Player.prototype.swipe = function(){

		var boxes = JSON.parse(JSON.stringify(this.weaponColBoxes[this.direction]));

		boxes = boxes.map(function(box){
			box.x += this.x;
			box.y += this.y;
			box.width = box.width;
			box.height = box.height;
			box.tag = "sword";
			box.name = this.name;
			return box;
		}.bind(this));
		
		tools.checkAll(boxes, game.forAllOtherAlivePlayers.bind(game, this));
	
	};

	Player.prototype.getFootCoordinates = function(){
		if(this.direction == "D"){
			if(this.stepToggle) return {x: this.x + (this.width - 10), y: this.y  + this.height};
			else return {x: this.x, y: this.y  + this.height};
		}
		if(this.direction == "U"){
			if(this.stepToggle) return {x: this.x + (this.width - 10), y: this.y + this.height};
			else return {x: this.x, y: this.y + this.height};
		}
		if(this.direction == "R"){
			return {x: this.x, y: this.y + this.height + 10};
		}
		if(this.direction == "L"){
			return {x: this.x + this.width, y: this.y + this.height + 10};
		}
	}
		
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
