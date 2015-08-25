//for all players
//make sure all images are same image
//make sure server and client are like doing things correclty i guess -- not sure how they interact now


//connect to sockets on server
var socket = io.connect(window.location.hostname);
socket.on('connect', function(data) {

	socket.emit("confirm_name", {user.name})
	
});
socket.on('error', function() { console.error(arguments) });
socket.on('message', function() { console.log(arguments) });  

// Create the canvas in the html
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.setAttribute("id", "game");
document.body.appendChild(canvas);

//check for keyInputs
var inputManager = {};

inputManager.keys = [];

addEventListener("keydown", function (e) {
	inputManager.keys[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete inputManager.keys[e.keyCode];
}, false);

inputManager.masterKeys = function(modifier){			   	

	if(13 in this.keys){
		socket.emit("startgame_server", {});
	}

	if (38 in this.keys) { // user holding up
		camera.y += 700 * modifier;
	}
	if (40 in this.keys) { // user holding down
		camera.y -= 700 * modifier;
	}
	if (37 in this.keys) { // user holding left
		camera.x += 700 * modifier;	
	}
	if (39 in this.keys) { // user holding right
		camera.x -= 700 * modifier;
	}
};

inputManager.pressable = {
	enter:true,
	z:true,
	k:true,
};

//setUp Game object;
var game = {
	
	connected:false,
	gameState:"init",
	timeLimit:720,
	currentSec:0,
	server:{},
	client:{}

};

game.forAllPlayers = function(func){
	
	for(var name in this.server.teams){

		for(var i = 0; i < this.server.teams[name].players.length; i++){
			
			func(this.server.teams[name].players[i]);
		}

	}
	
}

game.forAllTeams = function(func){

	for(var name in this.server.teams){

		func(this.server.teams[name]);

	}

}

game.checkCollision = function(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;
       }

   }
   
   return false;
}

var URI = window.location.pathname.split( '/' );
//setUp users user
var user = {
	name: URI[URI.length-1];
	amount:0,
	weapon:{
		has:false;
		power:false;
	}
	log:{
		has: false,
		stolen: false,
		stolenFrom: "",
		wood: 0,
	},
	dashing:false,
	dashStart:0,
	server:{
		attacking:false;
	}
	x:0,
	y:0,
	
	hasPapa = false;
	hasSword = false;
	
	dead = false;
	
};

user.interactWBase = function(){
	
	renderer.stealText = false;

	if(!this.PAPABEAR){
			
		game.forAllTeams(function(team){
			
			if(game.checkCollision(this, team.base, 41, 36, 140, 84, -25, -25)){
		
				if(this.team == team.name){
				
					this.depLog();
				
				}else{
				
					if(team.score != 0){
				
						renderer.stealText = true;
				
						if(this.action){
					
							this.stealWood(team.name);
						}
				
					}
				
				}

			}
			
		});

	}

}	

user.interactWTree = function(){
	
	renderer.treeText = false;
	
	if(!this.PAPABEAR){
	
		for(var i = 0; i < game.server.trees.length; i++){
			
			if(game.server.trees[i].removed == false && !this.dead){
			
				if(game.checkCollision(this, trees[i], 41, 36, 78, 78, -25, -25)){
			
					renderer.treeText = true;		
		
					if(this.action){
			
						this.chopTree(i);
			
					}	
				
				}

			}
			
		}
	}
}

user.interactWNote = function(){
	//messages
	if(this.PAPABEAR == false){

		for (var z = 0; z < notes.length; z++){
			
			if(game.server.notes[z].removed == false){
		
				if ((game.checkCollision({x: game.server.notes[z].x + 29, y: game.server.notes[z].y + 29}, this, 20, 20, 41, 36, 0, 0))){
					
					var chance = Math.floor(Math.random() * 100);
					
					var probability;
					
					if(chance < 50){
						probability = 1;	
					}else{
						probability = 2;
					}
					
					var notes = noteIndex[probability].filter(function(note){
						return note.condition();
					});
								
					renderer.currentNote = notes[Math.floor(Math.random() * notes.length)];

					renderer.showNote = true;
					
					renderer.currentNote.func.apply(null, renderer.currentNote.args)

					getNote(z);
				}


			}
			
		}
	
	}

}

user.stealWood = function(team){
	
	if(this.log.has == false){
				
		this.log.has = true;
		
		this.log.stolen = true;
		
		this.log.stolenFrom = team;
		
	    socket.emit('stealWood', {team: team});
				
 	}
	
}

user.chopTree = function(treename){
		
	if(this.log.has == false){
		
		this.log.has = true;
		
		this.log.stolen = false;
		
		this.log.wood = 50;
		
	    socket.emit('chopTree', {name: treename});
				
 	}
		
};

user.getNote = function(notename){
			
	socket.emit('getNote', {name: notename});
		
};

user.depLog = function(){
	
	if(this.log.has){
		
		this.log.has = false;

	   	socket.emit('depLog', {team: this.team, amount: this.log.wood});
	
	}
};

user.givePower = function(power){
	socket.emit('give_power', {name: this.name, power: power});
};

user.dash = function(){
	
	if(Date.now() > this.dashStart + 100 && this.dashing){
		
		this.moved = false;
		
		if(Date.now() > this.dashStart + 700){
			
			this.dashing = false;
		}
		
	}
}

user.move = function(modifier){
	
	this.dash();
	
	if((this.moved || this.dashing) && !this.dead){
		
		this.amount = 256 * modifier;
		
		if(this.PAPABEAR){
			
			this.amount = this.amount * 1.2;
		}
		
		if(this.dashing){
			
			this.amount = amount * 5;
		}
		
		socket.emit('move_input', {direction: this.direction, name: this.name, amount: this.amount});
	}
}

//setUp Renderer
var renderer = {
	refs:{},
	camera : {
	
		x:0,
		y:0
	},
	
	treeText: false,
	stealText: false,

	currentNote : {};
	
	showNote: false,
};

renderer.upload = function(src){
	var newImg = new Image();
	newImg.src = "images/" + ref + ".png";
	this.refs[src] = newImg;
	this.refs[src].onload = function(){
		
		this.loaded = true;
		
	}.bind(this.refs[src]);
}

//upload all images
[
"usershadow",
"bear",
"swordR",
"swordL",
"swordD",
"swordU",
"counter",
"pile",
"backpacks",
"background",
"blueteam",
"greenteam",
"redteam",
"housered",
"houseblue",
"housegreen",
"pines",
"bluecorpse",
"redcorpse",
"greencorpse",
].forEach(function(image){
	renderer.upload(image);
})

renderer.updateCamera = function(){
	
	this.camera.y = canvas.height/2 - users.y;
	this.camera.x = canvas.width/2 - users.x;
}

renderer.drawImage = function(image, coordX, coordY){
	
	ctx.drawImage(this.refs[image], coordX + this.camera.x, coordY + this.camera.y)
};

renderer.drawSprite(image, coordX, coordY, sprite){
	
	ctx.drawImage(this.refs[image], sprite.x, sprite.y, sprite.width, sprite.height, coordX + this.camera.x, coordY + this.camera.y)

}

renderer.draw = {};

renderer.draw["loading"] = function(){
	
	ctx.fillText("Loading....99%", window.innerWidth/4, 100);

}	

renderer.draw["wait"] = function(){

	ctx.fillStyle = "rgb(0,0,0)";

	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
   
	
	 ctx.fillText("There are three villages. You are " + user.name + " of the " + user.team + " village.", 100, 120);

	 ctx.fillText("Only one village will survive this harsh winter, so you must stockpile as much wood as you can.", 100, 160);

	 ctx.fillText("Learn how better to survive by searching the woods for notes.", 100,240);

	 //ctx.fillText("with the arrow keys. Confer with your allies by using enter key to type.", 100, 250);

	 ctx.fillText("Good luck.", 100, 340);

	 ctx.fillText("Waiting for game to game.start....", 100, 480);
}

renderer.draw["score"] = function(){
	
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
   
	var y = 100;
	game.forAllTeams(function(team){
			
		ctx.fillText(team.name" : " + team.score , window.innerWidth/4, y+=100);
			
	});

}

renderer.draw["end"] = function(){
	

}

renderer.animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

renderer.hasLoaded = function(){
	
	//scroll through all images
	for(var image in this.refs){
		//check if loaded
		if(this.refs.hasOwnProperty(image){
			
			if(!this.refs[image].loaded) return false;
		}
	
	}
	
	return true;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomArbitrary( numone,  numtwo) {
	return Math.floor(Math.random() * (numtwo - numone) + 1);
}

var chatController = {
	
	this.started = false;
};

chatController.process = function(){
	if(!this.started){
		this.show();
	}else{
		this.submit();
	}

}

chatController.show = function(){

	this.started = true;

	$('#chatView').show();
	$('#chatInput').focus();
}

chatController.submit = function(){
	
	this.started = false;

	$('#chatView').hide();
	
	//$('#game').focus();

	chatMessage = $('#chatInput').val();
	
	$('#chatInput').attr('value','');
	
	socket.emit("sendChat", {message: chatMessage, user: user.name});
	
}

inputManager.processInput = function(){
	
	if(13 in inputManager.keys){
		
		if(inputManager.pressable.enter){
			
			inputManager.pressable.enter = false;	
		
			chatController.process();
		}
		
	}else{
		
		inputManager.pressable.enter = true;
		
	}
	
	if (90 in inputManager.keys) { // user holding z
		
		if(inputManager.pressable.z && user.dashing == false){
			
			inputManager.pressable.z = false;
			
			user.dashing = true;
			
			user.dashStart = Date.now();
		}
		
	}else{
		
		inputManager.pressable.z = true;
	}

	//Check key inputs
	user.moved = false;
	user.direction = "";
	
	if (38 in inputManager.keys) 
		user.direction = "up";
		user.moved = true;
		
	if (40 in inputManager.keys)
		user.direction = "down";
		user.moved = true;
	
	if (37 in inputManager.keys)
		user.direction = "left";
		user.moved = true;
	
	if (39 in inputManager.keys)
		user.direction = "right";
		user.moved = true;
		
	if(88 in inputManager.keys){
		renderer.showNote = false;
	}
	
	if(32 in inputManager.keys) user.action = true;
	else user.action = false;
	//equip sword
	if (75 in inputManager.keys) {		
		if(inputManager.pressable.k && user.weapon.has == true){
			inputManager.pressable.k = false;
			
			if (user.attacking == false) {

			    socket.emit('arm', {name: user.name armed: true});

			}else {
			    socket.emit('arm', {name: user.name, armed: false});
			}
		}
	}else{
		inputManager.pressable.k = true;	
	}
	


	if (48 in inputManager.keys) {
	
		socket.emit('user_killed', {name: user.name});
	
	}
	
	
	//special ability: change color
	if (77 in inputManager.keys) { // change color of character
		if (users[username].canDisguise == true){// has ability
		
			//pick team
			if (66 in inputManager.keys) {
				socket.emit('changeteam', {name: user.name, canDisguise: false, team: "blue"});
			}
			if (82 in inputManager.keys) {
				socket.emit('changeteam', {name: user.name, canDisguise: false, team: "red"});
			} 
			if (71 in inputManager.keys) {
				socket.emit('changeteam', {name: user.name, canDisguise: false, team: "green"});
			} 
		}
	}	
}

var noteIndex = {};

var Note = function(lines, options){
	
	if(typeof options.condition == 'number'){
		
		this.condition = function(){
			
			return options.condition > game.currentSec;
		};
		
	}else{
			
		this.condition = options.condition;

	}
	
	this.lines = lines;

	this.probability = options.probability;
	
	this.func = options.action.func;
	this.args = options.action.args;
	
	if(noteIndex[options.probability]) noteIndex[options.probability].push(this);
	else noteIndex[options.probability] = [this];
}

game.client.notes = [

 new Note(["If you manage to steal your opponent's wood, there is a considerable payoff."], 1, 0),
 
 new Note(["Press Z to dash forward"], {prob: 1, condition: 0})),
 
 new Note(["Press ENTER to chat with nearby users"], {prob: 1, condition: 0})),
 
 new Note(["You can now press 'k' to wield a deadly weapon."], 1, 0, {prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),
 
 new Note(["You have picked up a knife. Press 'k' to use it, but be careful where you point it."], {prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),

 new Note(["Press 'k' to brandish your knife and then press 'k' again to hide it."], {prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),

 new Note(["Appearances can be deceiving...stay on guard"], {prob: 1, condition: 0}),
 
 new Note(["You have picked up a disguise. Hold 'm' and then", "press r,g or b to impersonate another team."],{prob: 1, condition: 0, action:{func: user.givePower, args: "weapon"}}),


];

// Update game objects
game.update = function (modifier) {
	
	user.move(modifier);
	user.interactWBase();
	user.interactWTree();
	user.interactWNote();
	
	renderer.updateCamera();
	
};

renderer.draw['clear_frame'] = function(){
	ctx.fillStyle = "rgb(105,175,105)";
	ctx.fillRect(0,0, canvas.width, canvas.height);
}
// Draw everything
renderer.draw["game"] = function () {
	
	ctx.fillStyle = "rgb(255,255,255)";
	
	//tiled background
	for(var x = 0; x < 6; x++){
	
		for(var y = 0; y < 6; y++){

			this.drawImage("background", x * 944, y * 807);

		}
	}
	
	//teams and their scores and stuff
	game.forAllTeams(function(team){
		
		//wood piles
		var row = 1;
		var col = 1;
		var x = 0;
		var y = 0;

		for(var i = 1; i < team.score; i+= 150){
			
			col += .5;
			if(row < 2) row += 1;
			else row = 1;
			
			x = -Math.floor(col) * 24;
			
			y = -Math.floor(row) * 26;
			
			this.drawImage("pile", (team.baseX - 53) + x, (team.baseY + 61));
		}
		
		//actual base
		this.drawImage('house' + team.name, team.baseX, team.baseY);
		
		//baseScore
		ctx.fillStyle = "white";
		ctx.font="11px Georgia";
		
		ctx.fillText(team.score, team.baseX - 3, team.baseY + 65);
		
	}.bind(this));

	//trees
	var treeSpriteFinder = {
		1:{x:0, y:0, width:111, height:131},
		2:{x:114, y:0, width:111, height:131},
		3:{x:0, y:131, width:111, height:131},
		4:{x:115, y:132, width:111, height:131},
	}
	
	for(i =0; i< game.server.trees.length; i++){
		
		if(!game.server.trees[i].removed) this.drawSprite('pines', trees[i].x - 9, trees[i].y - 9, treeSpriteFinder[game.server.trees[i].treeNum]);
		
	}
	
	//notes
	ctx.fillStyle = "rgb(0,0,180)";
	for(i =0; i< game.server.notes.length; i++){
		
		if(!game.server.notes[i].removed) this.drawImage('note', game.server.notes[i].x + 29, game.server.notes[i].y + 29);
		
	}
		
	game.forAllPlayers(function(player){
		//shadows
		this.drawImage("usershadow", player.x -1 , player.y + 11);

		//CHARACTER DRAWING
		if(player.dead){
			
			this.drawImage(player.team.name + "Corpse", player.x- 4, player.y);
		
		}else if(player.PAPABEAR){
			
			var papaSpriteFinder= {
				"R":{x:0, y:0, width:63, height:129},
				"D":{x:0, y:66, width:63, height:129},
				"L":{x:66, y:0, width:63, height:129},
				"U":{x:66, y:66, width:63, height:129},
			}
			
			this.drawSprite("bear", player.x,player.y, papaSpriteFinder[player.direction]);
			
		}else{
			
			var playerSpriteFinder = {
				"L":{x:2 + ((player.character-1) * 43), y:2, width:41, height:36},
				"R":{x:2 + ((player.character-1) * 43), y:40, width:41, height:33},
				"D":{x:2 + ((player.character-1) * 43), y:75, width:41, height:35},
				"U":{x:2 + ((player.character-1) * 43), y:113, width:41, height:36},
			}
			
			this.drawSprite(player.team.name + "team", player.x,player.y, playerSpriteFinder[player.direction]);
	
		}
		
		if(player.dead == false){
			
			if(player.log.has){

				var backpackSpriteFinder = {
					"R":{x:0, y:0, width:60, height:40, playerDelta:{x: -14, y:-3}},
					"D":{x:0, y:40, width:60, height:43, playerDelta:{x: -20, y:-10}},
					"U":{x:0, y:83, width:60, height:39, playerDelta:{x: -20, y:-5}},
					"L":{x:0, y:126, width:60, height:40, playerDelta:{x: 0, y:-3}},	
				}

				this.drawImage("backpack", player.x + backpackSpriteFinder[player.direction].playerDelta.x, player.y + backpackSpriteFinder[player.direction].playerDelta.y, backpackSpriteFinder[player.direction]);
			}
		
			if (player.attacking && player.PAPABEAR == false){
				//SWORD DRAWING		
				ctx.fillStyle = "rgb(200,200,200)";
				
				var swordHelper = {
					"U":{x: 36, y: -22},
					"D":{x:0, y: 20},
					"R":{x:36, y:22},
					"L":{x:-26, y:22},
				}
				
				ctx.fillRect(player.x + swordHelper[player.direction].x, player.y + swordHelper[player.direction].y, player.weapon.vwidth, player.weapon.vheight);	
			}		
		
		}	
		
		//chat drawing
		ctx.font = '20px Calibri';
		ctx.fillStyle = "rgb(255,255,0)";
		if(player.chatting) ctx.fillText(player.chatText, player.x - 40  , player.y - 20  );
	
	}.bind(this));
	
	
	//TEXT OVERLAYS
    ctx.font = '40px Calibri';
	ctx.fillStyle = "rgb(0,0,0)";

	//show text for chopping
	if(this.treeText && !user.log.has) ctx.fillText("Press space to cut wood!", window.innerWidth/4, window.innerHeight - 100);

	//show text for stealing
	if(this.stealText) ctx.fillText("Press space to steal wood!", window.innerWidth/4, window.innerHeight - 100);
		
	//show respawn text
	if(user.dead) ctx.fillText("You will respawn soon", window.innerWidth/8, 325);	
	
	//show note text
	if(this.showNote){
		
		ctx.font = '20px Calibri';

		this.currentNote.forEach(function(line, i){
			
			ctx.fillText(line, window.innerWidth/8, 200 + (i*25));
			
		}.bind(this));
	
	}
	
	//time limit
	if(game.currentSec > game.timeLimit - 100) ctx.fillStyle = "rgb(255,0,0)";
	else ctx.fillStyle = "rgb(0,0,0)";

	ctx.fillText((game.timeLimit - game.currentSec) + " Seconds Left", 50, 80);
		
};

game.stateManager = function () {

	//delta modifier
    var now = Date.now();
    var delta = now - this.then;
	
	renderer.draw['clear_frame']();
	
	if(user.name == "master") inputManager.masterKeys(delta/1000);
      
	if(game.state == "loading"){
		
		if(renderer.hasLoaded()) game.state = "waiting";

	}
   
	if(game.state == "waiting"){
		
		if(user.confirmed){
			
			renderer.state = "intro";

			
		}else{
			
			renderer.state = "server";

		}
				  

		if(game.started) game.state = "game";

	}
	   

	if(game.state == "game"){
  
	    if(!user.name = "master"){	
			inputManager.processInput();
			game.update(delta / 1000);	
		} 
				
		renderer.state = "game";
		
		//endgame
		if(game.timeLimit - game.currentSec <= 0){
			game.state = "won";
		}
			
	}
	
	if(game.state == "won"){
		
		renderer.state = "score";

	}
	
	if(renderer.draw[renderer.state]) renderer.draw[renderer.state]();
	
	this.then = now;

	renderer.animate(this.stateManager);
     
};


socket.on('name_confirmed', function(data) {
	user.name = data.name;
	user.confirmed = true;
});

socket.on('startgame', function(data) {

	game.started = true;
		
});

socket.on('stealTotal', function(data) {
	
	user.log.wood = data.total;
	
});

socket.on('update_clients', function(data) {

	game.server = data.game;
	game.currentSec = data.time;
		
});

socket.on("death", function(data){
	
	user.log.has = false;

	if(user.log.stolen){
	
		user.log.stolen = false;

		socket.emit("depLog", {team: user.log.stolenFrom, amount: user.log.wood})

		user.log.stolenFrom = "";
	
	}

})

$(document).load(function() {

	game.state = 'loading';
	
	renderer.state = "loading";
	
	game.then = Date.now();
	game.stateManager();

});

