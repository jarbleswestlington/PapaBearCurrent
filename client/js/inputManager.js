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

inputManager.processInput = function(modifier){
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

	//Check key inputs
	user.moved = false;
	
	if(user.server.freeCamera){

		var oldCam = {};
		oldCam.x = renderer.camera.x;
		oldCam.y = renderer.camera.y;

		if (38 in inputManager.keys) { // user holding up
			renderer.camera.y += 200 * modifier;
		}
		if (40 in inputManager.keys) { // user holding down
			renderer.camera.y -= 200 * modifier;
		}
		if (37 in inputManager.keys) { // user holding left
			renderer.camera.x += 200 * modifier;	
		}
		if (39 in inputManager.keys) { // user holding right
			renderer.camera.x -= 200 * modifier;
		}

		if(Math.abs(renderer.camera.x - (canvas.width/2 - (user.server.x + user.server.width/2))) + Math.abs(renderer.camera.y - (canvas.height/2 - (user.server.y + user.server.height/2))) > 1300) renderer.camera = oldCam;

	}else if(!user.server.frozen && !user.frozen){
	
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

	if (48 in inputManager.keys) {
		socket.emit('user_killed', {name: user.name});
	}
	
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