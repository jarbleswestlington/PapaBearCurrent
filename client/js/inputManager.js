//check for keyInputs
var inputManager = {};

inputManager.keys = [];

addEventListener("keydown", function (e) {
	inputManager.keys[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete inputManager.keys[e.keyCode];
}, false);

inputManager.processInput = function(){
	
	
	if(13 in inputManager.keys){
		
		if(inputManager.pressable.enter){
			
			inputManager.pressable.enter = false;	
		
			chatController.process();
		}
		
	}else{
		
		inputManager.pressable.enter = true;
		
	}
	
	if(chatController.started) return;
	
	if (87 in inputManager.keys) { // w
	
		if(inputManager.pressable.w){
			inputManager.pressable.w = false;	
			if(builder.on) builder.request();
			else if(user.server.log.has) builder.start("wall");
		}
		
	}else{
		inputManager.pressable.w = true;
		
	}
	
	if (88 in inputManager.keys) { // x
		
		if(inputManager.pressable.x){
			inputManager.pressable.x = false;
			if(builder.on) builder.scrap();
		}
	
	}else{
		inputManager.pressable.x = true;
		
	}
	
	if (16 in inputManager.keys) { // Player pressed shift
		
		if(inputManager.pressable.shift && user.server.weapon.state == "ready"){
						
			inputManager.pressable.shift = false;
			user.swipe();
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
	if (75 in inputManager.keys) {				
		if(inputManager.pressable.k && user.server.powers.spear == true){
			inputManager.pressable.k = false;
			user.arm();
		}
	}else{
		inputManager.pressable.k = true;	
	}
	

	if (48 in inputManager.keys) {
		socket.emit('user_killed', {name: user.name});
	}
	
	//special ability: change color
	if (77 in inputManager.keys) { // change color of character
		if (user.server.powers.disguise == true){// has ability
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
	}	
}


inputManager.masterKeys = function(modifier){	
	if(13 in this.keys){
		if(this.pressable.enter){
			this.pressable.enter = false;
			if(game.state == "game"){
				//socket.emit()
			}else{
				socket.emit("startgame_server", {});
			}
		} 
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

inputManager.pressable = {
	enter:true,
	z:true,
	k:true,
	shift:true,
	w:true,
	x:true,
	space:true,
};