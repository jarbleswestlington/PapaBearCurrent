//connect to sockets on server
var socket = io.connect(window.location.hostname);
socket.on('connect', function(data) { });
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

inputManager.masterKeys = function(){			   	

	if(13 in this.keys){
		socket.emit("startgame_server", {});
	}

	if (38 in this.keys) { // user holding up
		camera.y += 700 * delta/1000;
	}
	if (40 in this.keys) { // user holding down
		camera.y -= 700 * delta/1000;
	}
	if (37 in this.keys) { // user holding left
		camera.x += 700 * delta/1000;	
	}
	if (39 in this.keys) { // user holding right
		camera.x -= 700 * delta/1000;
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

//setUp users user
var user = {
	amount:0,
	messageReset:false,
	lastMessage:0,
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

user.interactWMessage = function(){
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
	
	ctx.drawImage(image, coordX + this.camera.x, coordY + this.camera.y)
};

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
 
 new Note(["You can now press 'k' to wield a deadly weapon."], 1, 0, {prob: 1, condition: 0, action:{func: user.givePower, args: "weapon"}}),
 
 new Note(["You have picked up a knife. Press 'k' to use it, but be careful where you point it."], {prob: 1, condition: 0, action:{func: user.givePower, args: "weapon"}}),

 new Note(["Press 'k' to brandish your knife and then press 'k' again to hide it."], {prob: 1, condition: 0, action:{func: user.givePower, args: "weapon"}}),

 new Note(["Appearances can be deceiving...stay on guard"], {prob: 1, condition: 0}),
 
 new Note(["You have picked up a disguise. Hold 'm' and then", "press r,g or b to impersonate another team."],{prob: 1, condition: 0, action:{func: user.givePower, args: "weapon"}}),


];


// Update game objects
game.update = function (modifier) {
	
	user.move(modifier);
	user.interactWBase();
	user.interactWTree();
	user.interactWMessage();
	
	renderer.updateCamera();
	
};


renderer.draw['clear_frame'] = function(){
	ctx.fillStyle = "rgb(105,175,105)";
	ctx.fillRect(0,0, canvas.width, canvas.height);
}
// Draw everything
renderer.draw["game"] = function () {
	
	//tiled background
	for(var x = 0; x < 6; x++){
	
		for(var y = 0; y < 6; y++){

			this.drawImage(backgroundImage, x * 944, y * 807);

		}
	}

	ctx.fillStyle = "rgb(255,0,0)";

	//testing123

	//ctx.drawImage(counter, blueBase.x + camera.x - 5, blueBase.y + camera.y + 40);


	if(score.blue > 0){

	ctx.drawImage(pileImage2, blueBase.x + camera.x - 53, blueBase.y + camera.y + 61);
	}
	if(score.blue > 150){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 77, blueBase.y + camera.y + 61);
	}
	if(score.blue > 300){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 70, blueBase.y + camera.y + 47);
	}
	if(score.blue > 450){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 101, blueBase.y + camera.y + 61);
	}
	if(score.blue > 600){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 100, blueBase.y + camera.y + 61);
	}
	if(score.blue > 750){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 93, blueBase.y + camera.y + 47);

	}
	if(score.blue > 900){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 124, blueBase.y + camera.y + 61);

	}
	if(score.blue > 1050){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 117, blueBase.y + camera.y + 47);

	}
	if(score.blue > 1200){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 148, blueBase.y + camera.y + 61);

	}
	if(score.blue > 1350){

			ctx.drawImage(pileImage2, blueBase.x + camera.x - 141, blueBase.y + camera.y + 47);

	}
	if(score.blue > 1500){

		ctx.drawImage(pileImage2, blueBase.x + camera.x - 75, blueBase.y + camera.y + 33);

	}
	if(score.blue > 1650){

		ctx.drawImage(pileImage2, blueBase.x + camera.x - 99, blueBase.y + camera.y + 33);

	}
	if(score.blue > 1650){

	ctx.drawImage(pileImage2, blueBase.x + camera.x - 123, blueBase.y + camera.y + 33);

	}

	
	ctx.drawImage(blueBaseImage, blueBase.x + camera.x, blueBase.y + camera.y);
	ctx.fillStyle = "white";
	ctx.font="11px Georgia";
	ctx.drawImage(counter, blueBase.x + camera.x - 8, blueBase.y + camera.y + 50);
	ctx.fillText(score.blue,  blueBase.x + camera.x - 3, blueBase.y + camera.y + 65);

	
	ctx.drawImage(greenBaseImage, greenBase.x + camera.x, greenBase.y + camera.y);
	ctx.fillText(score.green,  greenBase.x + camera.x, greenBase.y + camera.y);
	
	ctx.drawImage(redBaseImage, redBase.x + camera.x, redBase.y + camera.y);
	ctx.fillText(score.red,  redBase.x + camera.x, redBase.y + camera.y);
	

	//trees
	for(i =0; i< trees.length; i++){

		//treeNum = 1;

		//getRandomInt(1,4);
		//if((i<trees.length) && (!trees[i].reuser.moved))
		
		if(!trees[i].reuser.moved){

		
			ctx.fillStyle = "rgb(150,100,100)";

			switch (trees[i].treeNum){

			case 1:
			
				ctx.drawImage(pinesImage, 0, 0, 111, 131, trees[i].x + camera.x - 9, trees[i].y + camera.y - 9, 111, 131);

			break;

			
			case 2:
				ctx.drawImage(pinesImage, 114, 0, 220, 131, trees[i].x + camera.x - 9, trees[i].y + camera.y - 9, 220, 131);

			break;

			case 3:
				ctx.drawImage(pinesImage, 0, 131, 111, 257, trees[i].x + camera.x - 9, trees[i].y + camera.y - 9, 111, 257);

			break;

			
			case 4:
				ctx.drawImage(pinesImage, 114, 132, 220, 257, trees[i].x + camera.x - 9, trees[i].y + camera.y - 9, 220, 257);

			break;

			}
		
		}
		
		
	}
	
	//notes
	for(i =0; i< notes.length; i++){
		
		if(!notes[i].reuser.moved){
		
			ctx.fillStyle = "rgb(0,0,180)";
			
			ctx.drawImage(notesImage, notes[i].x + camera.x + 29, notes[i].y + camera.y + 29);
					
		}
		
	}
		
	for(i=0; i < users.length; i++){
		//shadows
	//if (users[i].direction == "L"){
		ctx.drawImage(usershadow, users[i].x + camera.x -1 , users[i].y + camera.y + 11, 41,36);
	//}	

		//CHARACTER DRAWING
		if(users[i].dead){
			

			if (users[i].team == "green"){
				
				ctx.drawImage(greenCorpse, users[i].x + camera.x - 4, users[i].y + camera.y);
			
			}
			
			if (users[i].team == "red"){
				
				ctx.drawImage(redCorpse, users[i].x + camera.x - 4, users[i].y + camera.y);
			
			}
			if (users[i].team == "blue"){
				
				ctx.drawImage(blueCorpse, users[i].x + camera.x - 4, users[i].y + camera.y);
			
			}
		
		
		}else if(users[i].PAPABEAR==true){

			if (users[i].direction == "R") { 
			ctx.drawImage(bearImage, 0, 0, 63, 63, users[i].x + camera.x, users[i].y + camera.y, 63,63);
			}else if (users[i].direction == "D"){ 
			ctx.drawImage(bearImage, 0, 66, 63, 129, users[i].x + camera.x, users[i].y + camera.y, 63,129);
			}else if (users[i].direction == "L"){
			ctx.drawImage(bearImage, 66, 0, 129, 63, users[i].x + camera.x, users[i].y + camera.y, 129,63);
			}else if (users[i].direction == "U"){
			ctx.drawImage(bearImage, 66, 66, 129, 129, users[i].x + camera.x, users[i].y + camera.y, 129,129); 
			}
				//losing papa bear on death
		}else if (users[i].renderteam == "green"){
		
			if (users[i].character == 1){
				if (users[i].direction == "L") {				
					ctx.drawImage(greenImage, 2, 2, 41, 36, users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){				
					ctx.drawImage(greenImage, 2, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,33);
				}else if (users[i].direction == "D"){
					ctx.drawImage(greenImage, 2, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,35);
				}else if (users[i].direction == "U"){
					ctx.drawImage(greenImage, 2, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);	
				}	
		
			}else if (users[i].character == 2){
				if (users[i].direction == "L" ){
					ctx.drawImage(greenImage, 45, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "R"){	
						
					ctx.drawImage(greenImage, 45, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){				
					ctx.drawImage(greenImage, 45, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "U"){				
					ctx.drawImage(greenImage, 45, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}
		
			}else if (users[i].character == 3){
				if (users[i].direction == "L") {
					ctx.drawImage(greenImage, 88, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){
					ctx.drawImage(greenImage, 88, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){
					ctx.drawImage(greenImage, 88, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "U"){
					ctx.drawImage(greenImage, 88, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}
		
			}
	
		}else if (users[i].renderteam == "blue"){

			if (users[i].character == 1){
				if (users[i].direction == "L") {				
					ctx.drawImage(blueImage, 2, 2, 41, 36, users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){				
					ctx.drawImage(blueImage, 2, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,33);
				}else if (users[i].direction == "D"){
					ctx.drawImage(blueImage, 2, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,35);
				}else if (users[i].direction == "U"){
					ctx.drawImage(blueImage, 2, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);	
				}	
		
			}else if (users[i].character == 2){
				if (users[i].direction == "L" ){
					ctx.drawImage(blueImage, 45, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "R"){	
						
					ctx.drawImage(blueImage, 45, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){				
					ctx.drawImage(blueImage, 45, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "U"){				
					ctx.drawImage(blueImage, 45, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}
		
			}else if (users[i].character == 3){
				if (users[i].direction == "L") {
					ctx.drawImage(blueImage, 88, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){
					ctx.drawImage(blueImage, 88, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){
					ctx.drawImage(blueImage, 88, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "U"){
					ctx.drawImage(blueImage, 88, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}
		
			}

		}else if (users[i].renderteam == "red"){
	
			if (users[i].character == 1){
				if (users[i].direction == "L") {				
					ctx.drawImage(redImage, 2, 2, 41, 36, users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){				
					ctx.drawImage(redImage, 2, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,33);
				}else if (users[i].direction == "D"){
					ctx.drawImage(redImage, 2, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,35);
				}else if (users[i].direction == "U"){
					ctx.drawImage(redImage, 2, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);	
				}	
		
			}else if (users[i].character == 2){
				if (users[i].direction == "L" ){
					ctx.drawImage(redImage, 45, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "R"){	
						
					ctx.drawImage(redImage, 45, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){				
					ctx.drawImage(redImage, 45, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "U"){				
					ctx.drawImage(redImage, 45, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}
		
			}else if (users[i].character == 3){
				if (users[i].direction == "L") {
					ctx.drawImage(redImage, 88, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){
					ctx.drawImage(redImage, 88, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){
					ctx.drawImage(redImage, 88, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "U"){
					ctx.drawImage(redImage, 88, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}
		
			}
	
		}else if (users[i].renderteam == "yellow" && !threeteams){
	
			if (users[i].character == 1){
			
				if (users[i].direction == "L") {		
							
					ctx.drawImage(yellowImage, 2, 2, 41, 36, users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){				
					ctx.drawImage(yellowImage, 2, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,33);
				}else if (users[i].direction == "D"){
					ctx.drawImage(yellowImage, 2, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,35);
				}else if (users[i].direction == "U"){
					ctx.drawImage(yellowImage, 2, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);	
				}	
		
			}else if (users[i].character == 2){
				
				if (users[i].direction == "L" ){
					ctx.drawImage(yellowImage, 45, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "R"){	
						
					ctx.drawImage(yellowImage, 45, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){				
					ctx.drawImage(yellowImage, 45, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}else if (users[i].direction == "U"){				
					ctx.drawImage(yellowImage, 45, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
			
				}
		
			}else if (users[i].character == 3){
				
				if (users[i].direction == "L") {
					ctx.drawImage(yellowImage, 88, 2, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "R"){
					ctx.drawImage(yellowImage, 88, 40, 41, 33,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "D"){
					ctx.drawImage(yellowImage, 88, 75, 41, 35,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}else if (users[i].direction == "U"){
					ctx.drawImage(yellowImage, 88, 113, 41, 36,users[i].x + camera.x, users[i].y + camera.y, 41,36);
				}
		
			}
	
		}
		

		//chat drawing
	    ctx.font = '20px Calibri';
		
		ctx.fillStyle = "rgb(255,255,0)";
		
		if(users[i].chatting){
						
			ctx.fillText(users[i].chatText, users[i].x - 40 + camera.x, users[i].y - 20 + camera.y);
		
		}
			
		if(users[i].dead == false){

			//testing123
			if (preSwiping){

					if (users[i].direction == "L"){
						ctx.drawImage(swordL, users[i].x + camera.x + 10, users[i].y + camera.y - 42);
					}
						if (users[i].direction == "R"){
						ctx.drawImage(swordR, users[i].x + camera.x + 10, users[i].y + camera.y + 38);
					}
						if (users[i].direction == "D"){
						ctx.drawImage(swordU, users[i].x + camera.x - 42, users[i].y + camera.y + 12);
					}
						if (users[i].direction == "U"){
						ctx.drawImage(swordD, users[i].x + camera.x + 41, users[i].y + camera.y + 12);
					}
			}

			if (swipage){

						if (users[i].direction == "R"){
						ctx.drawImage(swordL, users[i].x + camera.x + 10, users[i].y + camera.y - 42);
					}
						if (users[i].direction == "L"){
						ctx.drawImage(swordR, users[i].x + camera.x + 10, users[i].y + camera.y + 38);
					}
						if (users[i].direction == "U"){
						ctx.drawImage(swordU, users[i].x + camera.x - 42, users[i].y + camera.y + 12);
					}
						if (users[i].direction == "D"){
						ctx.drawImage(swordD, users[i].x + camera.x + 41, users[i].y + camera.y + 12);
					}


				swipeArch = ctx.fillStyle = "rgb(255,255,0)"


				 if (users[i].direction == "U"){

					swipeX = users[i].x + camera.x + 19;
					swipeY = users[i].y + camera.y + 19;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 0, Math.PI, true);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
      				//ctx.closePath();
					//ctx.fillStyle = "rgb(255,255,0)";
					//ctx.fill();	
				}else if (users[i].direction == "D"){
					 	
					swipeX = users[i].x + camera.x + 19;
					swipeY = users[i].y + camera.y + 19;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 0, Math.PI, false);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
				}else if (users[i].direction == "L"){
					 	
					swipeX = users[i].x + camera.x + 19;
					swipeY = users[i].y + camera.y + 17;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 4.7, Math.PI*.5, true);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
				}else if (users[i].direction == "R"){
					 	
					swipeX = users[i].x + camera.x + 19;
					swipeY = users[i].y + camera.y + 17;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 4.7, Math.PI*.5, false);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();	
				}
			
			}

			//testing123

			if(hasLog == true){


				if (users[i].direction == "R"){
							ctx.drawImage(backpackImage, 0, 0, 60, 40, users[i].x + camera.x -14, users[i].y + camera.y - 3, 60,40);
				}else if (users[i].direction == "D") { 
							ctx.drawImage(backpackImage, 0, 40, 60, 43, users[i].x + camera.x -20, users[i].y + camera.y - 10, 60, 43);
				}else if (users[i].direction == "U") { 
							ctx.drawImage(backpackImage, 0, 83, 60, 39, users[i].x + camera.x - 20, users[i].y + camera.y -5, 60, 39);
				}else if (users[i].direction == "L") { 
							ctx.drawImage(backpackImage, 0, 126, 60, 40, users[i].x + camera.x, users[i].y + camera.y - 3, 60, 40);
				}
			}



			//donetesting



	
			//SWORD DRAWING		
			ctx.fillStyle = "rgb(200,200,200)";
		
			if (users[i].attacking && users[i].PAPABEAR == false){
	
				if(users[i].swordBearer == true){

					weapon.hwidth = 45;
					weapon.hheight = 7;
					weapon.vwidth = 7;
					weapon.vheight = 45;
					
					//ctx.fillStyle = "rgb(255, 255,0)";					

				}else{
					
					weapon.hwidth = 30;
					weapon.hheight = 5;
					weapon.vwidth = 5;
					weapon.vheight = 30;
	
				}

				if (users[i].direction == "U"){

					weaponRect = ctx.fillRect(users[i].x + camera.x + 36, users[i].y + camera.y - 22, weapon.vwidth, weapon.vheight);	
				}else if (users[i].direction == "D"){

					weaponRect = ctx.fillRect(users[i].x + camera.x, users[i].y + camera.y + 20, weapon.vwidth, weapon.vheight);	
				}else if (users[i].direction == "R"){

					weaponRect = ctx.fillRect(users[i].x + camera.x + 36, users[i].y + camera.y + 22, weapon.hwidth, weapon.hheight);	
				}else if (users[i].direction == "L") {

					weaponRect = ctx.fillRect(users[i].x + camera.x - 26, users[i].y + camera.y + 22, weapon.hwidth, weapon.hheight);	
				}

			}		
		
		}	
	
	}
	
    ctx.font = '40px Calibri';
	
	//show text for chopping
	if(treeText){
		
		ctx.fillStyle = "rgb(0,0,0)";
		
		
		if(!hasLog){
		
			ctx.fillText("Press space to cut wood!", window.innerWidth/4, window.innerHeight - 100);
		
		//}else{
			
			//ctx.fillText("You already have a log", window.innerWidth/4, window.innerHeight - 100);
			
			
		}
		
	}
	
	
	//show text for stealing
	if(stealText){
		
		ctx.fillStyle = "rgb(0,0,0)";
		
		
		ctx.fillText("Press space to steal wood!", window.innerWidth/4, window.innerHeight - 100);
		
	}
	
	if(game.currentSec > game.timeLimit - 100){
		
		ctx.fillStyle = "rgb(255,0,0)";
		
	}else{
		
		ctx.fillStyle = "rgb(0,0,0)";
		
	}
	
	ctx.fillText((game.timeLimit - game.currentSec) + " Seconds Left", 50, 80);
	
	ctx.fillStyle = "rgb(0,0,0)";
	
	if(users[username].dead){
		
		ctx.fillText("You will respawn soon", window.innerWidth/8, 325);
		
	}
	
	if(hasLog){
		

		//ctx.fillText("You are holding " + woodTotal + " pieces of wood", window.innerWidth/4, window.innerHeight - 50);
		
		if(users[username].dead){
			
			hasLog = false;
			
			stolen = false;
			
			socket.emit("depLog", {team: stolenFrom, amount: woodTotal})
		
			stolenFrom = "";
		}
		
	}
	
	
    ctx.font = '20px Calibri';
	
	//show note text
	if(showNote){
		
		//(noteMessage);
	
		ctx.fillText(noteMessage.line1, window.innerWidth/8, 200);
		ctx.fillText(noteMessage.line2, window.innerWidth/8, 225);
		ctx.fillText(noteMessage.line3, window.innerWidth/8, 250);
		ctx.fillText(noteMessage.line4, window.innerWidth/8, 275);
		ctx.fillText(noteMessage.line5, window.innerWidth/8, 300);
	
	}
	
	//console.log(users[username]);
	
};

game.stateManager = function () {

	//delta modifier
    var now = Date.now();
    var delta = now - this.then;
	
	renderer.draw['clear_frame']();
      
	if(game.state == "loading"){
		
		if(renderer.hasLoaded()) game.state = "waiting";

	}
   
	if(game.state == "waiting"){
				  
		renderer.state = "intro";

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


socket.on('user_set', function(data) {
	user.confirmed = data.success;
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

$(document).load(function() {

	game.state = 'loading';
	
	renderer.state = "loading";
	
	game.then = Date.now();
	game.stateManager();

});

