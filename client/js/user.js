var URI = window.location.pathname.split( '/' );
//setUp users user
var user = {
	
	name: URI[URI.length-1],
	amount:0,
	
	master: URI[URI.length-1] == "master" ? true: false,
	mode: URI[URI.length-1] == "master" ? "master" : "player",
	dashing:false,
	dashStart:0,
	moved: false,
	client:{},
	frozen:false,
	inPlace:false,
	confirmed: false,
	queue: function(){},
	mPlayers : [],
	
	notes:[],
	
	buildMode:true,
	building: {},
	server: {},
};

user.queue.currentPriority = -1;

user.log = {
	has: false,
	stolen: false,
	stolenFrom: "",
	wood: 0,
};

user.client.weapon = {};
user.client.weapon.renderData = {

	"winding up": {
	    "U": {x: 42, y: 12, image: "swordD" },               
	    "D": {x: - 42, y: 12, image: "swordU"},
	    "L": {x: 10, y: -42, image: "swordL"},
	    "R": {x: 10, y: 38, image: "swordR"}
	},

	"attacking": {
	    "U": {x: -42, y: 12, image: "swordU" },               
	    "D": {x: 41, y: 12, image: "swordD" },
	    "L": {x: 10, y: 38, image: "swordR" },
	    "R": {x: 10, y: -42, image: "swordL"}
	},

	"blur": {
	    "U": {x: 19, y: 19, num1: 0, num2: (Math.PI), reversal: true},               
	    "D": {x: 19, y: 19, num1: 0, num2: (Math.PI), reversal: false},
	    "L": {x: 19, y: 17, num1: 4.7, num2: (Math.PI*.5), reversal: true},
	    "R": {x: 19, y: 17, num1: 4.7, num2: (Math.PI*.5), reversal: false}

	},
	
	//drawing a swipe using only code
	"drawBlur": function(player, data){
	    swipeX = data.x + player.x + renderer.camera.x;
	    swipeY = data.y + player.y + renderer.camera.y;
	    ctx.beginPath();
	    radius = 55;
	    ctx.arc(swipeX, swipeY, radius, data.num1, data.num2, data.reversal);
	    ctx.lineWidth = 10;
	    ctx.strokeStyle = "rgb(255,255,0)";
	    ctx.stroke();   
	}
}

user.usePower = function(power){
	if(power == "sword") soundscape.broadcast("swipe", 20);
	socket.emit("use_power", {name: user.name, power: power});
}

user.getHoldingCoords = function(obj){
	
	var info = {};
	
	if(this.direction == "up"){
		info.y = user.server.y-obj.height-1;
		info.x = user.server.x;
	}
	
	if(this.direction == "left"){
		
		info.y = user.server.y;
		info.x = user.server.x - obj.width-1;
	} 
	
	if(this.direction == "right"){
		
		info.y = user.server.y;
		info.x = user.server.x + user.server.width+1;
	} 
	
	if(this.direction == "down"){
		
		info.y = user.server.y + user.server.height+1;
		info.x = user.server.x;
	}
		
	return info;
}


user.processActionQueue = function(){
	if(user.queue.constructor == Function) user.queue();
	else if(user.queue.constructor == Array) user.queue.forEach(function(action){ action() });	
	user.queue = function(){};
	//set priority low so it can be overwritte 
	user.queue.currentPriority = -1;
}

user.checkNearbyGridNodes = function(){

	for(var x = 0; x < game.saved.grid.length; x++){
		for(var y = 0; y < game.saved.grid[x].length; y++){

			var item = game.saved.grid[x][y].contains;
			if(!item || item.removed) continue;		

			if(item.tag == "note") user.interfaceNote(item);
			if(item.tag == "tree") user.interfaceTree(item);

		}
	}
}

user.checkNearbyObjects = function(){
			
	for(var i = 0; i < game.saved.objects.length; i++){	

		var object = game.saved.objects[i];
						
		if(object.removed || this.server.dead) continue;	
		
		if(object.type == "wall") user.interfaceWall(object, i)
		else if(object.type == "drop") user.interfaceDrop(object, i);
				
	}
	
}

user.interactWBase = function(){
	
	if(!this.server.powers.papaBear){
			
		game.forAllTeams(function(team){
			
			if(tools.checkCollision(this.server, team.base, 41, 36, 140, 84, -25, -25)){
		
				if(this.server.team == team.name){

					this.depLog(team.name);
				
				}else{

					if(this.log.has && !this.log.stolen){
						this.depLog(team.name, 2);
					}
				
					if(team.score != 0){
				
						renderer.UI["space bar"].render = true;
						renderer.UI["space bar"].item = "Steal Wood";		
						if(this.action){
							this.stealWood(team.name);
							this.action = false;	
						}

					}

				}

			}
			
		}.bind(this));

	}

}	

user.interfaceTree = function(tree){

	if(this.server.dead || this.server.powers.papaBear) return;

	if(!tools.checkCollision(this.server, tree, 41, 36, 78, 78, -25, -25)) return;

	if(this.server.log.has) return;
	
	if(tree.priority < renderer.UI["space bar"].currentPriority) return;
	renderer.UI["space bar"].render = true;
	renderer.UI["space bar"].item = "Chop Tree";
	renderer.UI["space bar"].currentPriority = tree.priority;
			
	if(!this.action) return;

	if(tree.priority < this.queue.currentPriority) return;
	this.queue = this.chopTree.bind(this, tree, {x: tree.gridX, y: tree.gridY});
	this.queue.currentPriority = tree.priority;

}

user.interfaceWall = function(wall, index){

	if(!tools.colCheck(this.server, wall, {x: -25, y:-25})) return;
	
	if(wall.priority < renderer.UI["space bar"].currentPriority) return;
	renderer.UI["space bar"].render = true;
	renderer.UI["space bar"].item = "Chop Wall";
	renderer.UI["space bar"].currentPriority = wall.priority;
	
	if(!this.action) return;
	if(wall.priority < this.queue.currentPriority) return;
	if(!!this.server.powers.papaBear) this.queue = this.chopWall.bind(this, index, .2);
	else this.queue = this.chopWall.bind(this, index, 1);
	this.queue.currentPriority = wall.priority;

}

user.interfaceDrop = function(drop, index){

	if(this.server.powers.invisiblity || this.server.powers.papaBear) return;
	
	if( !tools.colCheck(drop, this.server) ) return;

	if(drop.priority < renderer.UI["space bar"].currentPriority) return;
	renderer.UI["space bar"].render = true;
	renderer.UI["space bar"].item = "Pick Up";
	renderer.UI["space bar"].currentPriority = drop.priority;

	if(!this.action) return;
	if(drop.priority < this.queue.currentPriority) return;
	this.queue = user.pickUp.bind(user, drop, index);
	this.queue.currentPriority = drop.priority;
}

user.interfaceNote = function(note){

	if(this.server.powers.papaBear || this.server.powers.invisibility) return;
										
	if ( !tools.colCheck(note, this.server) ) return;		
	
	if(note.priority < renderer.UI["space bar"].currentPriority) return;
	renderer.UI["space bar"].render = true;
	renderer.UI["space bar"].item = "Pick Up";
	renderer.UI["space bar"].currentPriority = note.priority;

	if(!this.action) return;
	if(note.priority < this.queue.currentPriority) return;
	
	Note.respond(note);	
	this.queue.currentPriority = note.priority;

}

user.pickUp = function(item, index){

	soundscape.play("pickUp");

	renderer.pickedUp = true;
	renderer.pickedUpItem = item.power;

	setTimeout(function(){
	  renderer.pickedUp = false;
	}, 1000);
		
	if(noteIndex[item.power]) {
		user.notes.push(noteIndex[item.power].id);
		user.readNote(noteIndex[item.power].id);
	}
	
	user.givePower(item.power);
	
	item.removed = true;
			
	socket.emit("remove_object", {index: index});
}


user.chopWall = function(index, amount){
	
	soundscape.broadcast("chop", 10);		

	chatController.submit("Chop!", 60);
	socket.emit("chop_wall", {index: index, amount:amount});
	
};

user.stealWood = function(team){
	
	if(this.log.has == false){
				
		this.log.has = true;
		
		this.log.stolen = true;
		
		this.log.stolenFrom = team;
		
	    socket.emit('stealWood', {team: team, name: this.name});
				
 	}
	
}

user.chopTree = function(tree, gridCoords){
	
	if(!this.log.has && !this.server.powers.papaBear){
		
		this.log.has = true;
		
		this.log.stolen = false;
		
		this.log.wood = 50;
		
		tree.removed = true;

		soundscape.broadcast("chop", 10);		
		
	    socket.emit('chopTree', {gridCoords: gridCoords, name: this.name});
				
 	}
		
};

user.readNote = function(id){
	note = noteIndex[id];

	renderer.UI["big screen"].forceRender = true;
	renderer.UI["big screen"].item = note.lines;
};

user.getNote = function(gridCoords, note){
	if(note.func) note.func.apply(this, note.args);
	user.notes.push(note.id);
	game.saved.grid[gridCoords.x][gridCoords.y].contains.removed = true;

	if (note.name == "empty"){
		soundscape.play("emptyChest");
	}else{
		soundscape.play("pickUp");
	}

	socket.emit('getNote', {gridCoords: gridCoords});	
};

user.depLog = function(team, multiplier){

	if(!multiplier) multiplier = 1;

	if(this.log.has){
				  
		if(this.log.stolen) this.log.stolen = false; 
		this.log.has = false;

		this.log.wood = this.log.wood * multiplier;
		chatController.submit(this.log.wood, 1000);

	   	socket.emit('depLog', {team: team, name: this.name, amount: this.log.wood});
	
	}
};

user.givePower = function(power){
	
	socket.emit('give_power', {name: this.name, power: power});
	
};

user.dash = function(){

	if(this.dashing) return;
	
	this.dashing = true;
	
	setTimeout(function(){
		this.frozen = true;
	}.bind(this), 100);
	
	setTimeout(function(){
		this.dashing = false;
		this.frozen = false;	
	}.bind(this), 700);
	
};

user.move = function(modifier){

	if( (this.moved || this.dashing) && !(this.dead || this.frozen || this.server.frozen) ){
		
		this.amount = 256 * modifier;
		
		if(this.server.powers.papaBear) this.amount = this.amount * 1.2;
		
		if(this.dashing) this.amount = this.amount * 5;
		
		if(this.inPlace) this.amount = 0;
		
		socket.emit('move_input', {direction: this.direction, name: this.name, amount: this.amount});

		if(game.server.testing){

			game.forAllPlayers(function(player){

				console.log("sending a message!");
				socket.emit('move_input', {direction: player.direction, name: player.name, amount: 0});
			})
		}
	}
};
