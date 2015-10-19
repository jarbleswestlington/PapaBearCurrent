//check for keyInputs
var inputManager = {};

inputManager.keys = [];
inputManager.mouse = {};

addEventListener("keydown", function (e) {	
	inputManager.keys[String.fromCharCode(e.keyCode)] = true;
	inputManager.keys[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete inputManager.keys[String.fromCharCode(e.keyCode)];
	delete inputManager.keys[e.keyCode];
}, false);

addEventListener("mousedown", function (e) {
	inputManager.mouse.down = true;
	inputManager.mouse.x = e.savedX;
	inputManager.mouse.y = e.savedY;
	inputManager.mouse.collider = {x: e.savedX, y: e.savedY, width: 1, height: 1};
	
}, false);

addEventListener("mouseup", function (e) {	
}, false);

inputManager.clear = function(){
	inputManager.mouse.down = false;
}

inputManager.processInput = function(){
	this.check();
	
	if(13 in inputManager.keys){
		
		if(inputManager.pressable.enter){
			
			inputManager.pressable.enter = false;	
		
			chatController.process();
		}
		
	}else{
		
		inputManager.pressable.enter = true;
		
	}
	
	if(chatController.started) return;

	
	if (88 in inputManager.keys) { // x
		
		if(inputManager.pressable.x){
			inputManager.pressable.x = false;
			if(builder.on) builder.scrap();
		}
	
	}else{
		inputManager.pressable.x = true;
		
	}
	
	if (16 in inputManager.keys) { // Player pressed shift
		
		if(inputManager.pressable.shift && user.server.weapon.state == "ready" && user.server.powers.sword){
						
			inputManager.pressable.shift = false;
			user.usePower("sword");
		}

	}else{
		inputManager.pressable.shift = true;
	}
	
	if (90 in inputManager.keys) { // user holding z
		
		if(inputManager.pressable.z && !user.dashing && !user.frozen && !user.server.frozen){
			
			inputManager.pressable.z = false;
		
			user.dash();
		}
		
	}else{
		
		inputManager.pressable.z = true;
	}

	//Check key inputs
	user.moved = false;
	
	if(!user.server.frozen && !user.frozen){
	
		if (38 in inputManager.keys) {
			user.direction = "up";
			user.moved = true;
		}
			
		if (40 in inputManager.keys){
			user.direction = "down";
			user.moved = true;
		}

		if (37 in inputManager.keys){
			user.direction = "left";
			user.moved = true;
		}

		if (39 in inputManager.keys){
			user.direction = "right";
			user.moved = true;
		}
	
	}
		
	if(88 in inputManager.keys){
		renderer.showNote = false;
	}
	
	user.action = false;
	
	if (32 in inputManager.keys) {				
		if(inputManager.pressable.space){
			inputManager.pressable.space = false;
			user.action = true;
		}
	}else{
		inputManager.pressable.space = true;	
	}
	//equip sword
	if (16 in inputManager.keys) {				
		if(inputManager.pressable.k && user.server.powers.spear){
			inputManager.pressable.k = false;
			user.usePower("spear");
		}
	}else{
		inputManager.pressable.k = true;	
	}
	

	if (48 in inputManager.keys) {
		socket.emit('user_killed', {name: user.name});
	}
	
	//special ability: change color
	//if (77 in inputManager.keys) { // change color of character
		if (user.server.powers.disguise){// has ability
			//pick team
			if (66 in inputManager.keys) {
				socket.emit('change_team', {name: user.server.name, team: "blue"});
			}
			if (82 in inputManager.keys) {
				socket.emit('change_team', {name: user.server.name, team: "red"});
			} 
			if (71 in inputManager.keys) {
				socket.emit('change_team', {name: user.server.name, team: "green"});
			}
		}
	//}	
}

inputManager.toCheck = [];

inputManager.registerKey = function(char, opts){
	
	if(opts.once) inputManager.pressable[char] = true;
	
	var newKey = {char: char, conditions: {}};
	if(opts.once) newKey.once = true;
	else newKey.once = false;
	
	if(opts.mode) newKey.mode = opts.mode;
	else newKey.mode = "player";
			
	if(opts.on) newKey.on = opts.on;
	if(opts.off) newKey.off = opts.off;
	
	if(opts.onCondition) newKey.conditions.on = opts.onCondition;
	else newKey.conditions.on = function(){return true};
	
	if(opts.offCondition) newKey.conditions.off = opts.offCondition;
	else newKey.conditions.off = function(){return true};

	if(opts.master) newKey.master = true;
	
	inputManager.toCheck.push(newKey);
}

inputManager.check = function(){
	
	this.toCheck.forEach(function(key){
		if(key.master && !user.master) return;
		if(key.mode != "all" && key.mode != user.mode) return;
		
		if( key.char in this.keys ){
			if( key.on && !key.conditions.on() ) return;
			if( key.once && !this.pressable[key.char] ) return;
			this.pressable[key.char] = false;
			if(key.on) key.on();
		}else{
			if( key.off && !key.conditions.off() ) return;
			if( key.once && this.pressable[key.char] ) return;
			this.pressable[key.char] = true;
			if( key.off ) key.off();	
		}
		
	}.bind(this));
}

inputManager.masterKeys = function(modifier){	
	
	this.check();
	
	if(13 in this.keys){
		if(this.pressable.enter){
			this.pressable.enter = false;
			if(game.state == "game"){
				socket.emit("startgame_server", {});
			}else{
				socket.emit("startgame_server", {});
			}
		} 
	}else{
		this.pressable.enter = true;
	}
	if (38 in this.keys) { // user holding up
		renderer.camera.y += 700 * modifier;
	}
	if (40 in this.keys) { // user holding down
		renderer.camera.y -= 700 * modifier;
	}
	if (37 in this.keys) { // user holding left
		renderer.camera.x += 700 * modifier;	
	}
	if (39 in this.keys) { // user holding right
		renderer.camera.x -= 700 * modifier;
	}
	
};

inputManager.changeKey = function(oldKey, newKey){
	
	this.toCheck.forEach(function(key){
		
		if(key.char == oldKey) key.char = newKey; 
	})
}

inputManager.pressable = {
	enter:true,
	z:true,
	k:true,
	shift:true,
	w:true,
	x:true,
	space:true,
};