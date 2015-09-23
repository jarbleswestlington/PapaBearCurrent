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
	
	mPlayers : [],
	
	notes:[],
	
	buildMode:true,
	building: {},
	server: {},
};

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

user.swipe = function(){
	soundscape.broadcast("swipe", 121);
	socket.emit("begin_swipe", {name: user.name,});

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

user.interactWBase = function(){
	
	renderer.stealText = false;

	if(!this.server.powers.papaBear && !this.server.powers.invisibility){
			
		game.forAllTeams(function(team){
			
			if(game.checkCollision(this.server, team.base, 41, 36, 140, 84, -25, -25)){
		
				if(this.server.team == team.name){

					this.depLog();
				
				}else{
				
					if(team.score != 0){
				
						renderer.spacebar = true;
						renderer.spacebarText = "Steal Wood!";
										
						if(this.action){
							this.action = false;							
							this.stealWood(team.name);
						}

					}
				
				}

			}
			
		}.bind(this));

	}

}	

user.interactWTree = function(){
		
	if(!this.server.powers.papaBear){
	
		for(var i = 0; i < game.client.trees.length; i++){
			
			if(game.client.trees[i].removed == false && !this.server.dead){
			
				if(game.checkCollision(this.server, game.client.trees[i], 41, 36, 78, 78, -25, -25)){
			
					renderer.spacebar = true;
					renderer.spacebarText = "Chop Tree";
							
					if(this.action){
						this.action = false;
						this.chopTree(i);
			
					}	
				
				}

			}
			
		}
	}
}

user.interactWObject = function(){
			
	for(var i = 0; i < game.client.objects.length; i++){	
						
		if(game.client.objects[i].removed || this.server.dead) continue;	
		
		if(game.client.objects[i].type == "wall"){
					
			if(!game.colCheck(this.server, game.client.objects[i], {x: -25, y:-25})) continue;
		
			renderer.spacebar = true;
			renderer.spacebarText = "Chop Wall";	
			
			if(!this.action){
				this.action = false;
				continue;	
			} 
			
			if(this.server.powers.papaBear) this.chopWall(i, .05);
			else this.chopWall(i, 1);
			
			break;
		
		}else if(game.client.objects[i].type == "power"){
			
			if(this.server.powers.invisiblity || this.server.powers.papaBear) continue;
			
			if(!game.colCheck(game.client.objects[i], this.server)) continue;
			
			renderer.spacebar = true;
			renderer.spacebarText = "Pick Up";
			
			if(!this.action){
				this.action = false;
				continue;	
			} 			
			user.pickUp(game.client.objects[i], i);
			
			break;
			
		}
				
	}
	
}

user.pickUp = function(item, index){
	renderer.pickedUp = true;
	renderer.pickedUpItem = item.power;

	setTimeout(function(){
	  renderer.pickedUp = false;
	}, 1000);
		
	if(noteIndex[item.power]) {
		user.notes.push(noteIndex[item.power]);
		user.readNote(noteIndex[item.power]);
	}
	
	user.givePower(item.power);
	
	item.removed = true;
			
	socket.emit("remove_object", {index: index});
}

user.interactWNote = function(){
		
	if(this.server.powers.papaBear || this.server.powers.invisibility) return;
		
	for (var z = 0; z < game.client.notes.length; z++){
				
		if(game.client.notes[z].removed) continue;		
							
		if (!game.checkCollision({x: game.client.notes[z].x + 29, y: game.client.notes[z].y + 29}, this.server, 20, 20, 41, 36, 0, 0)) continue;		
		
		renderer.spacebar = true;
		renderer.spacebarText = "Pick Up";
						
		if(!this.action){
			this.action = false;
			continue;	
		} 
							
		var redo = true;
		
		do{
			
			var chance = Math.floor(Math.random() * 100);
		
			var probability = 1;
		
			//customize this
			if(chance < 10){
				probability = 1;	
			}else{
				probability = 2;
			}
		
			var notes = noteIndex[probability].filter(function(note){
				return note.condition();
			});
		
			if(notes.length > 0) redo = false;
			
		}while(redo);
			
		var random = Math.floor(Math.random() * notes.length);

		var note = notes[random];

		this.readNote(note);

		this.getNote(z, note);
			
		break;				

	}
	
}

user.chopWall = function(index, amount){
	
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

user.chopTree = function(treeId){
	
	if(!this.log.has && !this.server.powers.papaBear){
		
		this.log.has = true;
		
		this.log.stolen = false;
		
		this.log.wood = 50;
		
		game.client.trees[treeId].removed = true;
		
	    socket.emit('chopTree', {id: treeId, name: this.name});
				
 	}
		
};

user.readNote = function(note){
	renderer.currentNote = note;
	renderer.showNote = true;
};

user.getNote = function(noteId, note){
	if(note.func) note.func.apply(this, note.args);
	user.notes.push(note);
	game.client.notes[noteId].removed = true;
	socket.emit('getNote', {id: noteId});
		
};

user.depLog = function(){

	if(this.log.has){
		
		chatController.submit(user.log.wood, 1000);
		  
		if(this.log.stolen) this.log.stolen = false; 
		this.log.has = false;
	   	socket.emit('depLog', {team: this.server.team, name: this.name, amount: this.log.wood});
	
	}
};

user.givePower = function(power){
	
	socket.emit('give_power', {name: this.name, power: power});
	
};

user.dash = function(){
	
	this.dashing = true;
	
	setTimeout(function(){
		this.dashing = false;
		this.frozen = true;
	}.bind(this), 100);
	
	setTimeout(function(){
		this.frozen = false;	
	}.bind(this), 700);
	
};

user.arm = function(){
	if (user.server.attacking == false) {
		
	    socket.emit('arm', {name: user.name, armed: true});

	}else {
		
	    socket.emit('arm', {name: user.name, armed: false});
	}
};

user.move = function(modifier){

	if( (this.moved || this.dashing) && !(this.dead || this.frozen || this.server.frozen) ){
		
		this.amount = 256 * modifier;
		
		if(this.server.powers.papaBear) this.amount = this.amount * 1.2;
		
		if(this.dashing) this.amount = this.amount * 5;
		
		if(this.inPlace) this.amount = 0;
		
		socket.emit('move_input', {direction: this.direction, name: this.name, amount: this.amount});
	}
};

var getWidth = function(player){
	if (player.direction == "U" || player.direction == "D"){
		return player.spear.height;
	}else if (player.direction == "L" || player.direction == "R"){
		return player.spear.width;
	}
};

var getHeight = function(player){
	if (player.direction == "U" || player.direction == "D"){
		return player.spear.width;
	}else if (player.direction == "L" || player.direction == "R"){
		return player.spear.height;
	}
};