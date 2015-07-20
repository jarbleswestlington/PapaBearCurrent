//testing123

var swipeX;
var backX;
var backY;
var swipeY;
var offsetSwipeY = 1;
var swipeStart = 0;
var swiping = false;
var swipage = false;
var preSwiping = false;
var hitting = false;
//var swipeVisible = false;

//donetesting


//state control variables
var timeLimit = 720;
var gameState = "load";
var gogo = false;
var messageReset = false;
var lastMessage = 0;
var threeteams = true;
var sCooldown = false;

var treeNum = 1;
// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.setAttribute("id", "game");


document.body.appendChild(canvas);

//upload all images
{

playershadow = new Image();
playershadow.src = "images/playershadow.png"

bearImage = new Image();
bearImage.src = "images/bear.png";

if(!threeteams){

	yellowImage = new Image();
	yellowImage.src = "images/yellowteam.png";

}

swordR = new Image();
swordR.src = "images/swordR.png";

swordL = new Image();
swordL.src = "images/swordL.png";

swordD = new Image();
swordD.src = "images/swordD.png";

swordU = new Image();
swordU.src = "images/swordU.png";

counter = new Image();
counter.src = "images/counter.png";

pileImage = new Image();
pileImage.src = "images/pile.png";

pileImage2 = new Image();
pileImage2.src = "images/pile2.png";

backpackImage = new Image();
backpackImage.src = "images/backpacks.png";

backgroundImage = new Image();
backgroundImage.src = "images/background.png";

blueImage = new Image();
blueImage.src = "images/blueteam.png";

greenImage = new Image();
greenImage.src = "images/greenteam.png";

redImage = new Image();
redImage.src = "images/redteam.png";

redBaseImage = new Image();
redBaseImage.src = "images/housered.png";

blueBaseImage = new Image();
blueBaseImage.src = "images/houseblue.png";

greenBaseImage = new Image();
greenBaseImage.src = "images/housegreen.png";

notesImage = new Image();
notesImage.src = "images/notes.jpg";

pinesImage = new Image();
pinesImage.src = "images/pines.png";

blueCorpse = new Image();
blueCorpse.src = "images/bluecorpse.png";
redCorpse = new Image();
redCorpse.src = "images/redcorpse.png";
greenCorpse = new Image();
greenCorpse.src = "images/greencorpse.png";

if(!threeteams){

yellowBaseImage = new Image();
yellowBaseImage.src = "images/houseyellow.png";

}

}

//Set up array and listeners for key inputs
keysDown = [];

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);

//a bunch of functions...

function checkCollision(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){


           return true;

       }

   }
}

function checkIfPapa(){
		
	for(i = 0; i < players.length; i++){
		
		if(players[i].PAPABEAR){

			return true;
		}
		
	}
	
	return false;
	
}

function checkIfSwordBearer(){
	
	for(i = 0; i < players.length; i++){
		
		if(players[i].swordBearer){
			
			return true;
		}
	}
	
	return false;
}

stolenFrom = "";
stolen = false;

function stealWood(team){
	
	if(hasLog == false){
				
		hasLog = true;
		
		stolen = true;
		
		stolenFrom = team;
		
	    socket.emit('stealWood', {team: team});
				
 	}
	
}

woodTotal = 50;

function chopTree(treeNumber){
		
	if(hasLog == false){
		
	 	trees[treeNumber].removed = true;
		
	 	//trees.splice(treeNumber, 1);
		
		hasLog = true;
		
		stolen = false;
		
		woodTotal = 50;
		
	    socket.emit('chopTree', {number: treeNumber});
				
 	}
		
}

function getNote(noteNumber){
	
 	notes[noteNumber].removed = true;
	
		
	socket.emit('getNote', {number: noteNumber});
	
		
}


function depLog(){
	
	if(hasLog){
		
		hasLog = false;

	   	socket.emit('depLog', {team: players[playerNumber].team, amount: woodTotal});
	
	}
}

function moveTowards(leader, follower, speed, modifier){

	if(leader.x >= follower.x + 20 + 1){
		
		follower.x += speed * modifier;
		
	}
	
	if(leader.x <= follower.x + 20 - 1){
		
		follower.x -= speed * modifier;
		
	}

	
	follower.y -= speed * modifier;

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomArbitrary( numone,  numtwo) {
	return Math.floor(Math.random() * (numtwo - numone) + 1);
}

function GiveCanDisguise(playerToGive){
	playerToGive.canDisguise = true;
	socket.emit('givechangeteam', {number: playerNumber, canDisguise: true});
}
function GiveWeapon(playerToGive){
	playerToGive.hasWeapon = true;
	socket.emit('giveWeapon', {number: playerNumber, hasWeapon: true});
}
function GivePowerSword(playerToGive){
	playerToGive.swordBearer=true;
	socket.emit('givesword', {number: playerNumber, swordBearer: true});
}
function GivePowerChosen(playerToGive){
	playerToGive.chosenOne=true;
	socket.emit('makechosen', {number: playerNumber, chosenOne: true});
	
}
function GivePapa(playerToGive, noteNumb){
	playerToGive.PAPABEAR=true;
	socket.emit('makepapa', {number: playerNumber, PAPABEAR: true, noteNumb: noteNumb});
}

//gameplay variables
trees = [];
notes = [];

moved = false;
movePlayer = "";

playerNumber = 0;

started = false;
players = [];

hasLog = false;
hasWeapon = false;

score = {
	
	red:0,
	green:0,
	blue:0,
	yellow:0
}

var swipe = {

	radius: 55,
}

var weapon = {

	hwidth: 30,
	hheight: 5,
	vwidth: 5,
	vheight: 30,
	getWidth: function(playerNumber){
		if (players[playerNumber].direction == "U" || players[playerNumber].direction == "D"){
			return this.vwidth;
		}else if (players[playerNumber].direction == "L" || players[playerNumber].direction == "R"){
			return this.hwidth;
		}
	},
	getHeight: function(playerNumber){
		if (players[playerNumber].direction == "U" || players[playerNumber].direction == "D"){
			return this.vheight;
		}else if (players[playerNumber].direction == "L" || players[playerNumber].direction == "R"){
			return this.hheight;
		}
		
	}
};

camera = {
	
	x:0,
	y:0
}

check = {
	
	x:0,
	y:0
}

 

blueBase = {

 

x: 1350,

y: 1350,

team: "blue"

}

redBase = {

 

x: 3280,

y: 2300,

team: "red"

}

greenBase = {

 

x: 1350,

y: 3350,

team: "green"
	
}

if(!threeteams){

yellowBase = {
	
	x: 2800,
	y: 2800,
	team: "yellow"
}

}


illegal = false;
var treeText = false;
stealText = false;
var messageNum = 0;

//render notes
showNote = false;
noteMessage = {
	line1:"",
	line2:"",
	line3:"",
	line4:"",
	line5:"Press X to close"
	
};

var startChat = false;

var dashStart = 0;

var dashing = false;

var enterPressable = true;
// Update game objects
var update = function (modifier) {
	
	if(13 in keysDown){
		
		if(enterPressable){
			
			enterPressable = false;	
		
			if(!startChat){
			
				startChat = true;
			
				$('#chatView').show();
				$('#chatInput').focus();
			
			
			}else{
			
				startChat = false;
			
				$('#chatView').hide();
				
				//$('#game').focus();
			
				chatMessage = $('#chatInput').val();
				
				$('#chatInput').attr('value','');
				
				socket.emit("sendChat", {message: chatMessage, player: playerNumber});
				
			}
		
	
		}
		
	}else{
		
		enterPressable = true;
		
	}
	
	
	
	
	////////
	///////
	/////
	/////
	/////
	
	if (90 in keysDown) { // Player holding z
		
		if(zpressable && dashing == false){
			
			zpressable = false;
			
			dashing = true;
			
			dashStart = Date.now();
			
		}
		
	}else{
		
		zpressable = true;
	}

	
	check.x = players[playerNumber].x;
	check.y = players[playerNumber].y;

	//Check key inputs
	moved = false;
	
	if (38 in keysDown) { // Player holding up
		
		check.y = players[playerNumber].y - 256 * modifier;
		
		movePlayer = "up";
		moved = true;
		
	}
	
	if (40 in keysDown) { // Player holding down
		
//		camera.y -= 256 * modifier;
		check.y = players[playerNumber].y + 256 * modifier;
		
		movePlayer = "down";
		moved = true;
		
	}
	
	if (37 in keysDown) { // Player holding left
				
//		camera.x += 256 * modifier;
		
		check.x = players[playerNumber].x - 256 * modifier;
		
		movePlayer = "left";
		moved = true;
		
		
	}
	
	if (39 in keysDown) { // Player holding right
			
//		camera.x -= 256 * modifier;

		check.x = players[playerNumber].x + 256 * modifier;

		movePlayer = "right";
		moved = true;
		
	}
	
	//COLLISIONS


			



	///
	///
	///Weapon height change
	if(players[playerNumber].swordBearer==true){

		weapon.hwidth = 45;
		weapon.hheight = 7;
		weapon.vwidth = 7;
		weapon.vheight = 45;

	}else{
		weapon.hwidth = 30;
		weapon.hheight = 5;
		weapon.vwidth = 5;
		weapon.vheight = 30;

	}
	///
	
	illegal = false;
	
	for(i = 0; i < players.length; i++){
		
		hit = false;
		
		if(i != playerNumber && !players[playerNumber].dead && !players[i].dead){

			
			if(!players[playerNumber].PAPABEAR){
		
				if(!players[i].PAPABEAR && checkCollision(check, players[i], 41, 36, 41, 36, 0, 0)){
				
					illegal = true;
				
					//console.log('it was fuckin illegal');
		
				}
			
			}






			//testing123
	if (16 in keysDown) { // Player holding shift
		
		if(shiftPressable && swiping == false){
			
			shiftPressable = false;
				
				preSwiping = true;
				swipeStart = Date.now();
				
				setTimeout(function() { 
					swiping = true;
					preSwiping = false;
		
			 }, 400);


			//insert preswiping phase

			//swiping = true;
			
			//swipeStart = Date.now();
			
		}
		
	}else{
		
		shiftPressable = true;
	}



	if(Date.now() > swipeStart + 100 && swiping == true){
		
		illegal = true;
		swipage = true;
		//hitting = true;
		
		if(Date.now() > swipeStart + 800 && swiping == true){
			
			swiping = false;
			swipage = false;
			//hitting = false;
		}
		
	}

		if(swipage == true && !players[playerNumber].dead){
		
			amount = 256 * modifier;

			//if (16 in keysDown){

				if (players[playerNumber].direction == "U"){
							
								if(checkCollision(players[i], {x: players[playerNumber].x - 35 + 20.5, y: players[playerNumber].y - 30}, 41, 36, 70, 50, 0, 0)){
									
								hit = true;
					
							}
								
								if(checkCollision({x: players[playerNumber].x - 33.5, y: players[playerNumber].y - 9}, players[i], 19, 29, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x - 7, y: players[playerNumber].y - 35}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
					
							}
								if(checkCollision({x: players[playerNumber].x + 2, y: players[playerNumber].y - 35}, players[i],  35, 9, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x + 53, y: players[playerNumber].y - 35}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
							}
								if(checkCollision({x: players[playerNumber].x + 54, y: players[playerNumber].y - 9}, players[i], 19, 29, 41, 36, 0, 0)){
								
								hit = true;
					
							}


				}

				if (players[playerNumber].direction == "D"){
							
								if(checkCollision(players[i], {x: players[playerNumber].x - 35 + 20.5, y: players[playerNumber].y + 20}, 41, 36, 70, 50, 0, 0)){
									
								hit = true;
					
							}
								
								if(checkCollision({x: players[playerNumber].x - 33.5, y: players[playerNumber].y + 20}, players[i], 19, 29, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x - 7, y: players[playerNumber].y + 70}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
					
							}
								if(checkCollision({x: players[playerNumber].x + 2, y: players[playerNumber].y + 70}, players[i],  35, 9, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x + 53, y: players[playerNumber].y + 70}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
							}
								if(checkCollision({x: players[playerNumber].x + 54, y: players[playerNumber].y + 20}, players[i], 19, 29, 41, 36, 0, 0)){
								
								hit = true;
					
							}
						}


						if (players[playerNumber].direction == "L"){
							
								if(checkCollision(players[i], {x: players[playerNumber].x - 30, y: players[playerNumber].y - 18}, 41, 36, 50, 70, 0, 0)){
									
								hit = true;
					
							}
								
								if(checkCollision({x: players[playerNumber].x - 9, y: players[playerNumber].y + 53}, players[i], 29, 19, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x - 35, y: players[playerNumber].y - 35}, players[i],  5, 9, 41, 36, 0, 0)){
								
								hit = true;
					
							}
								if(checkCollision({x: players[playerNumber].x - 39, y: players[playerNumber].y}, players[i],  9, 35, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x - 35, y: players[playerNumber].y - 9}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
							}
								if(checkCollision({x: players[playerNumber].x - 9, y: players[playerNumber].y - 37}, players[i], 29, 19, 41, 36, 0, 0)){
								
								hit = true;
					
							}
						}

							if (players[playerNumber].direction == "R"){
							
								if(checkCollision(players[i], {x: players[playerNumber].x + 20, y: players[playerNumber].y - 18}, 41, 36, 50, 70, 0, 0)){
									
								hit = true;
					
							}
								
								if(checkCollision({x: players[playerNumber].x + 20, y: players[playerNumber].y + 53}, players[i], 29, 19, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x + 70, y: players[playerNumber].y - 35}, players[i],  5, 9, 41, 36, 0, 0)){
								
								hit = true;
					
							}
								if(checkCollision({x: players[playerNumber].x + 70, y: players[playerNumber].y}, players[i], 9, 35, 41, 36, 0, 0)){
								
								hit = true;
					
							}

								if(checkCollision({x: players[playerNumber].x + 70, y: players[playerNumber].y - 9}, players[i],  9, 5, 41, 36, 0, 0)){
								
								hit = true;
							}
								if(checkCollision({x: players[playerNumber].x + 20, y: players[playerNumber].y - 37}, players[i], 29, 19, 41, 36, 0, 0)){
								
								hit = true;
					
							}
						}

						
					if(hit){
				
						socket.emit('player_killed', {number: i});
					
					}
				//}
			}
		//endtesting








			
			if(players[playerNumber].PAPABEAR){
							
				if(checkCollision(players[i], players[playerNumber], 41, 36, 63, 63, 0, 0)){
						
					hit = true;
			
				}
				
				if(hit){
			
					socket.emit('player_killed', {number: i});
			
				}
	
				
			}else{
			
			if(players[playerNumber].attacking){

				if(players[i].PAPABEAR && !players[playerNumber].swordBearer){ }else{
					
					if(players[i].PAPABEAR){
						
						bearX = 22;
						bearY = 27;
					}else{
						
						bearX = 0;
						bearY = 0;
					}


					if (players[playerNumber].direction == "U"){
				
						if(checkCollision({x: players[playerNumber].x + 36, y: players[playerNumber].y - 22}, players[i], weapon.getWidth(playerNumber), weapon.getHeight(playerNumber), 41 + bearX, 36 + bearY, 0, 0)){
							
							hit = true;
				
						}
				
					}else if (players[playerNumber].direction == "D"){

						if(checkCollision({x: players[playerNumber].x, y: players[playerNumber].y + 20}, players[i], weapon.getWidth(playerNumber), weapon.getHeight(playerNumber), 41 + bearX, 36 + bearY, 0, 0)){
			
							hit = true;
			
						}

					}else if (players[playerNumber].direction == "R"){

						if(checkCollision({x: players[playerNumber].x + 36, y: players[playerNumber].y + 22}, players[i], weapon.getWidth(playerNumber), weapon.getHeight(playerNumber), 41 + bearX, 36 + bearY, 0, 0)){
			
							hit = true;
				
						}
				
					}else if (players[playerNumber].direction == "L") {
				
						if(checkCollision({x: players[playerNumber].x - 26, y: players[playerNumber].y + 22}, players[i], weapon.getWidth(playerNumber), weapon.getHeight(playerNumber), 41 + bearX, 36 + bearY, 0, 0)){
			
							hit = true;
				
						}
				
					}
		
				}
				
				if(hit){
			
					socket.emit('player_killed', {number: i});
			
				}
				
				
			}
			
			}
			

		
		
		}
		
	}
	

	//testing123
	//BASECOLLISION

			if(checkCollision(check, blueBase, 41, 36, 161, 94, 0, 0) && !players[playerNumber].dead){
				illegal = true;
				if(checkCollision({x: players[playerNumber].x, y: players[playerNumber].y}, {x: blueBase.x + 2, y: blueBase.y + 2}, 41, 36, 159, 92, 0, 0)){
					illegal = false;
					socket.emit('quick_kill', {number: playerNumber});

				}
		}




	//donetesting


	treeText = false;
	
	for(i = 0; i < trees.length; i++){
		
		if(trees[i].removed == false && !players[playerNumber].dead){
		
			if(players[playerNumber].PAPABEAR){
				
				if(checkCollision(check, trees[i], 63, 63, 78, 78, 0, 0)){
			
					illegal = true;
				
				}
		
			}else{
			
				if(checkCollision(check, trees[i], 41, 36, 78, 78, 0, 0)){
			
					illegal = true;
			
	
				}
			
				if(checkCollision(players[playerNumber], trees[i], 41, 36, 78, 78, -25, -25)){
			
					treeText = true;		
		
					if(32 in keysDown){
			
						chopTree(i);
			
					}	
				
				}
			
			}	
		
		}
		
		
	}

	

	if(Date.now() > dashStart + 100 && dashing){
		
		illegal = true;
		
		if(Date.now() > dashStart + 700){
			
			dashing = false;
		}
		
	}


	
	if((moved || dashing) && !illegal && !players[playerNumber].dead){
		
		amount = 256 * modifier;
		
		if(players[playerNumber].PAPABEAR){
			
			amount = amount * 1.2;
			
		}
		
		if(dashing){
			
			amount = amount * 5;
		}
		
		
		
	    socket.emit('move_input', {direction: movePlayer, number: playerNumber, amount: amount});
		
	}
	//
	//
	//COLLISIONS END
	
	
	if(88 in keysDown){
		
		showNote = false;
	}
	
	//equip sword
	if (75 in keysDown) {		
		if(!kDown && hasWeapon == true){
			kDown = true;
			if (players[playerNumber].attacking == false) {
				players[playerNumber].attacking = true;
			    socket.emit('arm', {number: playerNumber, armed: true});

				
			}else {
			    socket.emit('arm', {number: playerNumber, armed: false});
			}
		}
	}else{
		kDown = false;	
	}
	

				


	if (48 in keysDown) {
	
		socket.emit('player_killed', {number: playerNumber});
	
	}
	
	
	//special ability: change color
	if (77 in keysDown) { // change color of character
		if (players[playerNumber].canDisguise == true){// has ability
		//	var startTimer = 0;
		//	startTimer += modifier * 1000;
		//	if (startTimer > 3){
				if (66 in keysDown) {
					players[playerNumber].team = "blue";
					socket.emit('changeteam', {number: playerNumber, canDisguise: false, team: "blue"});
				}
				if (89 in keysDown && !threeteams) {
					players[playerNumber].team = "yellow";
					socket.emit('changeteam', {number: playerNumber, canDisguise: false, team: "yellow"});
				} 
				if (82 in keysDown) {
					players[playerNumber].team = "red";
					socket.emit('changeteam', {number: playerNumber, canDisguise: false, team: "red"});
				} 
				if (71 in keysDown) {
					players[playerNumber].team = "green";
					socket.emit('changeteam', {number: playerNumber, canDisguise: false, team: "green"});
				} 

		//	}
		}
	}
		

	
	//messages
	if(players[playerNumber].PAPABEAR == false){
		//messages
		//messages
		for (var z = 0; z < notes.length; z++){
			

			if(notes[z].removed == false){
		
				if ((checkCollision({x: notes[z].x + 29, y: notes[z].y + 29}, players[playerNumber], 20, 20, 41, 36, 0, 0)) || (messageReset == true)){
					
					messageReset = false;

					noteMessage.line1 = ""
					noteMessage.line2 = "";
					noteMessage.line3 = "";
					noteMessage.line4 = "";

					if (elapsedseconds >= 480){
						messageNum = getRandomInt(13,17);
						
					}else if (elapsedseconds >= 440){
						messageNum = getRandomInt(11, 13);
						
					}else if (elapsedseconds >= 140){
						messageNum = getRandomInt(5, 10);
						
					}else{
						messageNum = getRandomInt(1, 7);
						
					}

					switch (messageNum){
					case 1:
						if (lastMessage == messageNum){
						messageReset = true;
						}
						else{
						noteMessage.line1 = "If you manage to steal your opponent's wood, there is a considerable payoff.";
						noteMessage.line2 = "";
						noteMessage.line3 = "";
						noteMessage.line4 = "";
						lastMessage = messageNum;
						}
					break;
					case 2:
						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{
							noteMessage.line1 = "Press z to dash forward";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							lastMessage = messageNum;
						}

					break;

					case 3:

						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{
							noteMessage.line1 = "Press ENTER to chat with nearby players";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							lastMessage = messageNum;
						}

					break;

					case 4:

						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{
							noteMessage.line1 = "You can now press 'k' to wield a deadly weapon.";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							hasWeapon = true;
							lastMessage = messageNum;
						}

					break;
					case 5:

						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{

							noteMessage.line1 = "You have picked up a knife. Press 'k' to use it, but be careful where you point it.";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							hasWeapon = true;
							lastMessage = messageNum;
						}


					break;

					case 6:						
						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{
							noteMessage.line1 = "Press 'k' to brandish your knife and then press 'k' again to hide it.";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							hasWeapon = true;
							lastMessage = messageNum;
						}

					break;
					case 7:
						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{
							noteMessage.line1 = "Appearances can be decieving...stay on gaurd";
							noteMessage.line2 = "";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							lastMessage = messageNum;
						}
					break;
					case 8:
						if (lastMessage == messageNum){
							messageReset = true;
						}
						else{	
							noteMessage.line1 = "You have picked up a disguise. Hold 'm' and then";
							noteMessage.line2 = "press r,g or b to impersonate another team.";
							noteMessage.line3 = "";
							noteMessage.line4 = "";
							lastMessage = messageNum;
							GiveCanDisguise(players[playerNumber]);
						}

					break;

					case 9:
						if (lastMessage == messageNum){
						messageReset = true;
						}
						else{
						noteMessage.line1 = "Some notes can give you immense power. This note does not.";
						noteMessage.line2 = "";
						noteMessage.line3 = "";
						noteMessage.line4 = "";
						lastMessage = messageNum;
						}
					break;
					case 10:
						if (lastMessage == messageNum){
						messageReset = true;
						}
						else{
						noteMessage.line1 = "Hold 'm' and press r,g, or b.";
						noteMessage.line2 = "Not everyone can disguse themselves...but some of your enemies can.";
						noteMessage.line3 = "";
						noteMessage.line4 = "";
						lastMessage = messageNum;
						GiveCanDisguise(players[playerNumber]);

						}
					
					break;

					case 11:

					if(!checkIfPapa()){
						
					noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
					noteMessage.line2 = "You are fast, deadly, and nearly invincible";
					noteMessage.line3 = "You can only be killed by a golden sword";
					noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
					GivePapa(players[playerNumber], z);
					hasLog = false;
					
					}else{
					
						noteMessage.line1 = "Papa Bear can be a powerful ally, but can you trust him?";
						noteMessage.line2 = "";
						hasWeapon = true;


						
					}
					
					break;

					case 12:

					if(!checkIfPapa()){
						
					noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
					noteMessage.line2 = "You are fast, deadly, and nearly invincible";
					noteMessage.line3 = "You can only be killed by a golden sword";
					noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
					GivePapa(players[playerNumber], z);
					
					}else{
					noteMessage.line1 = "Papa Bear has a secret..";
					noteMessage.line2 = "";
					hasWeapon = true;

					}
					break;

					case 13:
					if(!checkIfPapa()){
						
						noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
						noteMessage.line2 = "You are fast, deadly, and nearly invincible";
						noteMessage.line3 = "You can only be killed by a golden sword";
						noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
						GivePapa(players[playerNumber], z);
						hasLog = false;
						hasWeapon = true;

					}else{
						noteMessage.line1 = "The woods contain a note which can be used to kill Papa Bear";
						noteMessage.line2 = "";

					}
					break;

					case 14:

					if(!checkIfSwordBearer()){
						noteMessage.line1 = "Press 'k' to sheath and unsheathe a golden sword. This weapon can kill PAPA BEAR.";
						noteMessage.line2 = "";
						hasWeapon = true;

						GivePowerSword(players[playerNumber]);
					}else{
						noteMessage.line1 = "Only the golden sword can defeat PAPA BEAR.";
						noteMessage.line2 = "";

					}

					break;

					case 15:

					if(!checkIfSwordBearer()){
					noteMessage.line1 = "Press 'k' to sheath and unsheathe a golden sword. This weapon can kill PAPA BEAR.";
					GivePowerSword(players[playerNumber]);
					}else{
					noteMessage.line1 = "Right now someone has the golden sword that could defeat PAPA BEAR...";
					}
		
					case 16:
					noteMessage.line1 = "You have picked up a disguise. Hold 'm' and then";
					noteMessage.line2 = "press r,g or b to impersonate another team.";
					GiveCanDisguise(players[playerNumber]);
					break;

					case 17:

					noteMessage.line1 = "What sort of notes have your teammates read? Are they hiding something?";

					break;
					}

					showNote = true;

					getNote(z);
				}


			}
			
		}
	
	}


	
	
	
	//Stealing logs code
	stealText = false;
	
	//Depositing logs code
	//theres one for each team here due to inneficient programming
	
	if(!players[playerNumber].PAPABEAR){
		
		if(!threeteams){
	
			if(checkCollision(players[playerNumber], yellowBase, 41, 36, 140, 84, -25, -25)){
		
			if(players[playerNumber].team == yellowBase.team){
			
				depLog();
			
			}else{
			
				if(score.yellow != 0){
			
					stealText = true;
			
					if(32 in keysDown){
				
						stealWood('yellow');
					}
			
				}
			
			}
	
		}
	
		}
	
		if(checkCollision(players[playerNumber], redBase, 41, 36, 161, 94, -25, -25)){

			if(players[playerNumber].team == redBase.team){
			
				depLog();
			
			}else{
			
				if(score.red != 0){
			
					stealText = true;
			
					if(32 in keysDown){
				
						stealWood('red');
					}
			
				}
			}
	
		}

	
		if(checkCollision(players[playerNumber], blueBase, 41, 36, 161, 94, -25, -25)){

		
			if(players[playerNumber].team == blueBase.team){
			
				depLog();
			
			}else{
			
				if(score.blue != 0){
			
			
					stealText = true;
			
					if(32 in keysDown){
				
						stealWood('blue');
					}
			
			
				}
			}
	
		}
	
		if(checkCollision(players[playerNumber], greenBase, 41, 36, 161, 94, -25, -25)){

		
			if(players[playerNumber].team == greenBase.team){
			
				depLog();
			
			}else{
			
				if(score.green != 0){
					
					stealText = true;
			
					if(32 in keysDown){
				
						stealWood('green');
					}
			
				}
			
			}
	
		}
	
	}
	
	//endgame
	if(timeLimit - elapsedseconds <= 0){
		
		gameState = "won";
		
		
		
	}
	
};


// Draw everything
var render = function () {
	


	//tiled background

	for(q = 0; q < 6; q++){
	
		for(r = 0; r < 6; r++){

		ctx.drawImage(backgroundImage, q * 944 + camera.x, r * 807 + camera.y);

		}
	}



	if(playerNumber != 0){
	
		camera.y = canvas.height/2 - players[playerNumber].y;
		camera.x = canvas.width/2 - players[playerNumber].x;
	
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

	//donetesting


	//bases & score
	if(!threeteams){
		
		ctx.drawImage(yellowBaseImage, yellowBase.x + camera.x, yellowBase.y + camera.y);
	
		ctx.fillText(score.yellow,  yellowBase.x + camera.x, yellowBase.y + camera.y);
	
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
		//if((i<trees.length) && (!trees[i].removed))
		
		if(!trees[i].removed){

		
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
		
		if(!notes[i].removed){
		
			ctx.fillStyle = "rgb(0,0,180)";
			
			ctx.drawImage(notesImage, notes[i].x + camera.x + 29, notes[i].y + camera.y + 29);
					
		}
		
	}
		
	for(i=0; i < players.length; i++){
		//shadows
	//if (players[i].direction == "L"){
		ctx.drawImage(playershadow, players[i].x + camera.x -1 , players[i].y + camera.y + 11, 41,36);
	//}	

		//CHARACTER DRAWING
		if(players[i].dead){
			

			if (players[i].team == "green"){
				
				ctx.drawImage(greenCorpse, players[i].x + camera.x - 4, players[i].y + camera.y);
			
			}
			
			if (players[i].team == "red"){
				
				ctx.drawImage(redCorpse, players[i].x + camera.x - 4, players[i].y + camera.y);
			
			}
			if (players[i].team == "blue"){
				
				ctx.drawImage(blueCorpse, players[i].x + camera.x - 4, players[i].y + camera.y);
			
			}
		
		
		}else if(players[i].PAPABEAR==true){

			if (players[i].direction == "R") { 
			ctx.drawImage(bearImage, 0, 0, 63, 63, players[i].x + camera.x, players[i].y + camera.y, 63,63);
			}else if (players[i].direction == "D"){ 
			ctx.drawImage(bearImage, 0, 66, 63, 129, players[i].x + camera.x, players[i].y + camera.y, 63,129);
			}else if (players[i].direction == "L"){
			ctx.drawImage(bearImage, 66, 0, 129, 63, players[i].x + camera.x, players[i].y + camera.y, 129,63);
			}else if (players[i].direction == "U"){
			ctx.drawImage(bearImage, 66, 66, 129, 129, players[i].x + camera.x, players[i].y + camera.y, 129,129); 
			}
				//losing papa bear on death
		}else if (players[i].renderteam == "green"){
		
			if (players[i].character == 1){
				if (players[i].direction == "L") {				
					ctx.drawImage(greenImage, 2, 2, 41, 36, players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){				
					ctx.drawImage(greenImage, 2, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,33);
				}else if (players[i].direction == "D"){
					ctx.drawImage(greenImage, 2, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,35);
				}else if (players[i].direction == "U"){
					ctx.drawImage(greenImage, 2, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);	
				}	
		
			}else if (players[i].character == 2){
				if (players[i].direction == "L" ){
					ctx.drawImage(greenImage, 45, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "R"){	
						
					ctx.drawImage(greenImage, 45, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){				
					ctx.drawImage(greenImage, 45, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "U"){				
					ctx.drawImage(greenImage, 45, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}
		
			}else if (players[i].character == 3){
				if (players[i].direction == "L") {
					ctx.drawImage(greenImage, 88, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){
					ctx.drawImage(greenImage, 88, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){
					ctx.drawImage(greenImage, 88, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "U"){
					ctx.drawImage(greenImage, 88, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}
		
			}
	
		}else if (players[i].renderteam == "blue"){

			if (players[i].character == 1){
				if (players[i].direction == "L") {				
					ctx.drawImage(blueImage, 2, 2, 41, 36, players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){				
					ctx.drawImage(blueImage, 2, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,33);
				}else if (players[i].direction == "D"){
					ctx.drawImage(blueImage, 2, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,35);
				}else if (players[i].direction == "U"){
					ctx.drawImage(blueImage, 2, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);	
				}	
		
			}else if (players[i].character == 2){
				if (players[i].direction == "L" ){
					ctx.drawImage(blueImage, 45, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "R"){	
						
					ctx.drawImage(blueImage, 45, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){				
					ctx.drawImage(blueImage, 45, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "U"){				
					ctx.drawImage(blueImage, 45, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}
		
			}else if (players[i].character == 3){
				if (players[i].direction == "L") {
					ctx.drawImage(blueImage, 88, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){
					ctx.drawImage(blueImage, 88, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){
					ctx.drawImage(blueImage, 88, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "U"){
					ctx.drawImage(blueImage, 88, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}
		
			}

		}else if (players[i].renderteam == "red"){
	
			if (players[i].character == 1){
				if (players[i].direction == "L") {				
					ctx.drawImage(redImage, 2, 2, 41, 36, players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){				
					ctx.drawImage(redImage, 2, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,33);
				}else if (players[i].direction == "D"){
					ctx.drawImage(redImage, 2, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,35);
				}else if (players[i].direction == "U"){
					ctx.drawImage(redImage, 2, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);	
				}	
		
			}else if (players[i].character == 2){
				if (players[i].direction == "L" ){
					ctx.drawImage(redImage, 45, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "R"){	
						
					ctx.drawImage(redImage, 45, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){				
					ctx.drawImage(redImage, 45, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "U"){				
					ctx.drawImage(redImage, 45, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}
		
			}else if (players[i].character == 3){
				if (players[i].direction == "L") {
					ctx.drawImage(redImage, 88, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){
					ctx.drawImage(redImage, 88, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){
					ctx.drawImage(redImage, 88, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "U"){
					ctx.drawImage(redImage, 88, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}
		
			}
	
		}else if (players[i].renderteam == "yellow" && !threeteams){
	
			if (players[i].character == 1){
			
				if (players[i].direction == "L") {		
							
					ctx.drawImage(yellowImage, 2, 2, 41, 36, players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){				
					ctx.drawImage(yellowImage, 2, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,33);
				}else if (players[i].direction == "D"){
					ctx.drawImage(yellowImage, 2, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,35);
				}else if (players[i].direction == "U"){
					ctx.drawImage(yellowImage, 2, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);	
				}	
		
			}else if (players[i].character == 2){
				
				if (players[i].direction == "L" ){
					ctx.drawImage(yellowImage, 45, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "R"){	
						
					ctx.drawImage(yellowImage, 45, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){				
					ctx.drawImage(yellowImage, 45, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}else if (players[i].direction == "U"){				
					ctx.drawImage(yellowImage, 45, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
			
				}
		
			}else if (players[i].character == 3){
				
				if (players[i].direction == "L") {
					ctx.drawImage(yellowImage, 88, 2, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "R"){
					ctx.drawImage(yellowImage, 88, 40, 41, 33,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "D"){
					ctx.drawImage(yellowImage, 88, 75, 41, 35,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}else if (players[i].direction == "U"){
					ctx.drawImage(yellowImage, 88, 113, 41, 36,players[i].x + camera.x, players[i].y + camera.y, 41,36);
				}
		
			}
	
		}
		

		//chat drawing
	    ctx.font = '20px Calibri';
		
		ctx.fillStyle = "rgb(255,255,0)";
		
		if(players[i].chatting){
						
			ctx.fillText(players[i].chatText, players[i].x - 40 + camera.x, players[i].y - 20 + camera.y);
		
		}
			
		if(players[i].dead == false){

			//testing123
			if (preSwiping){

					if (players[i].direction == "L"){
						ctx.drawImage(swordL, players[i].x + camera.x + 10, players[i].y + camera.y - 42);
					}
						if (players[i].direction == "R"){
						ctx.drawImage(swordR, players[i].x + camera.x + 10, players[i].y + camera.y + 38);
					}
						if (players[i].direction == "D"){
						ctx.drawImage(swordU, players[i].x + camera.x - 42, players[i].y + camera.y + 12);
					}
						if (players[i].direction == "U"){
						ctx.drawImage(swordD, players[i].x + camera.x + 41, players[i].y + camera.y + 12);
					}
			}

			if (swipage){

						if (players[i].direction == "R"){
						ctx.drawImage(swordL, players[i].x + camera.x + 10, players[i].y + camera.y - 42);
					}
						if (players[i].direction == "L"){
						ctx.drawImage(swordR, players[i].x + camera.x + 10, players[i].y + camera.y + 38);
					}
						if (players[i].direction == "U"){
						ctx.drawImage(swordU, players[i].x + camera.x - 42, players[i].y + camera.y + 12);
					}
						if (players[i].direction == "D"){
						ctx.drawImage(swordD, players[i].x + camera.x + 41, players[i].y + camera.y + 12);
					}


				swipeArch = ctx.fillStyle = "rgb(255,255,0)"


				 if (players[i].direction == "U"){

					swipeX = players[i].x + camera.x + 19;
					swipeY = players[i].y + camera.y + 19;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 0, Math.PI, true);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
      				//ctx.closePath();
					//ctx.fillStyle = "rgb(255,255,0)";
					//ctx.fill();	
				}else if (players[i].direction == "D"){
					 	
					swipeX = players[i].x + camera.x + 19;
					swipeY = players[i].y + camera.y + 19;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 0, Math.PI, false);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
				}else if (players[i].direction == "L"){
					 	
					swipeX = players[i].x + camera.x + 19;
					swipeY = players[i].y + camera.y + 17;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 4.7, Math.PI*.5, true);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();
				}else if (players[i].direction == "R"){
					 	
					swipeX = players[i].x + camera.x + 19;
					swipeY = players[i].y + camera.y + 17;
					ctx.beginPath();
					swipeArch = ctx.arc(swipeX, swipeY, swipe.radius, 4.7, Math.PI*.5, false);
					ctx.lineWidth = 10;
      				ctx.strokeStyle = "rgb(255,255,0)";
      				ctx.stroke();	
				}
			
			}

			//testing123

			if(hasLog == true){


				if (players[i].direction == "R"){
							ctx.drawImage(backpackImage, 0, 0, 60, 40, players[i].x + camera.x -14, players[i].y + camera.y - 3, 60,40);
				}else if (players[i].direction == "D") { 
							ctx.drawImage(backpackImage, 0, 40, 60, 43, players[i].x + camera.x -20, players[i].y + camera.y - 10, 60, 43);
				}else if (players[i].direction == "U") { 
							ctx.drawImage(backpackImage, 0, 83, 60, 39, players[i].x + camera.x - 20, players[i].y + camera.y -5, 60, 39);
				}else if (players[i].direction == "L") { 
							ctx.drawImage(backpackImage, 0, 126, 60, 40, players[i].x + camera.x, players[i].y + camera.y - 3, 60, 40);
				}
			}



			//donetesting



	
			//SWORD DRAWING		
			ctx.fillStyle = "rgb(200,200,200)";
		
			if (players[i].attacking && players[i].PAPABEAR == false){
	
				if(players[i].swordBearer == true){

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

				if (players[i].direction == "U"){

					weaponRect = ctx.fillRect(players[i].x + camera.x + 36, players[i].y + camera.y - 22, weapon.vwidth, weapon.vheight);	
				}else if (players[i].direction == "D"){

					weaponRect = ctx.fillRect(players[i].x + camera.x, players[i].y + camera.y + 20, weapon.vwidth, weapon.vheight);	
				}else if (players[i].direction == "R"){

					weaponRect = ctx.fillRect(players[i].x + camera.x + 36, players[i].y + camera.y + 22, weapon.hwidth, weapon.hheight);	
				}else if (players[i].direction == "L") {

					weaponRect = ctx.fillRect(players[i].x + camera.x - 26, players[i].y + camera.y + 22, weapon.hwidth, weapon.hheight);	
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
	
	if(elapsedseconds > timeLimit - 100){
		
		ctx.fillStyle = "rgb(255,0,0)";
		
	}else{
		
		ctx.fillStyle = "rgb(0,0,0)";
		
	}
	
	ctx.fillText((timeLimit - elapsedseconds) + " Seconds Left", 50, 80);
	
	ctx.fillStyle = "rgb(0,0,0)";
	
	if(players[playerNumber].dead){
		
		ctx.fillText("You will respawn soon", window.innerWidth/8, 325);
		
	}
	
	if(hasLog){
		

		//ctx.fillText("You are holding " + woodTotal + " pieces of wood", window.innerWidth/4, window.innerHeight - 50);
		
		if(players[playerNumber].dead){
			
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
	
	//console.log(players[playerNumber]);
	
};

// The main game loop
var main = function () {

   var now = Date.now();
   var delta = now - then;
   
   
ctx.fillStyle = "rgb(105,175,105)";
ctx.fillRect(0,0, canvas.width, canvas.height);
   
ctx.fillStyle = "rgb(0,0,0)";

ctx.font = "24px Helvetica";
ctx.textAlign = "left";
   
	if(gameState == "load"){
   
		ctx.fillText("Loading....99%", window.innerWidth/4, 100);
   
	}
	   
	if(gameState == "wait"){
	
		  if(playerSet == true){

             ctx.fillText("There are three villages. You are villager #" + playerNumber + " of the " + players[playerNumber].team + " village.", 100, 120);

             ctx.fillText("Only one village will survive this harsh winter, so you must stockpile as much wood as you can.", 100, 160);

             ctx.fillText("Learn how better to survive by searching the woods for notes.", 100,240);


             //ctx.fillText("with the arrow keys. Confer with your allies by using enter key to type.", 100, 250);

     		 ctx.fillText("Good luck.", 100, 340);

               ctx.fillText("Waiting for game to start....", 100, 480);

      


 
	
			if(13 in keysDown && playerNumber == 0){

				socket.emit("startgame", {});

			}
	
		}

	}
	   
	   

	if(started){

	   if(gameState == "play"){
		   
		   if(playerNumber == 0){
		   	
			   	if (38 in keysDown) { // Player holding up
			   		camera.y += 700 * delta/1000;
			   	}
			   	if (40 in keysDown) { // Player holding down
			   		camera.y -= 700 * delta/1000;
			   	}
			   	if (37 in keysDown) { // Player holding left
			  		camera.x += 700 * delta/1000;	
			   	}
			   	if (39 in keysDown) { // Player holding right
			  		camera.x -= 700 * delta/1000;
			   	}
				
			   
		   }else{

	 		   update(delta / 1000);
		  
	  		}

	  	  render();

		}
		if(gameState == "won"){

			if(!threeteams){

				ctx.fillText("Yellow:" + score.yellow , window.innerWidth/4, 100);
			
			}
			ctx.fillText("Blue:" + score.blue , window.innerWidth/4, 200);
			ctx.fillText("Green:" + score.green , window.innerWidth/4, 300);
			ctx.fillText("Red:" + score.red , window.innerWidth/4, 400);
	
		}

	}
		
   then = now;
     
   // Request to do this again ASAP
   requestAnimationFrame(main);
};


playerSet = false;

socket.on('set_player', function(data) {
	players = data.players;

	playerNumber = data.number;	
	playerSet = true;
	
	socket.emit("player_added", {});
	
});

socket.on('startgame', function(data) {

	players = data.players;
	trees = data.trees;
	notes = data.notes;
	started = true;
	gameState = "play";
	
});

socket.on('treeChopped', function(data) {
	
 //	trees.splice(data.number, 1);
	
 	trees[data.number].removed = true;
	
	
});

socket.on('noteGot', function(data) {
	
 	notes[data.number].removed = true;
	
	//alert('yeah I spliced that fucker');
	
});

socket.on('logged', function(data) {
	
 	score = data.score;
	
});

socket.on('stealTotal', function(data) {
	
	woodTotal = data.total;
	
	
});


var elapsedseconds = 0;

socket.on('update_clients', function(data) {

	players = data.players;
	elapsedseconds = data.time;
		
});

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

// Let's play this game!
var then = Date.now();
main();


$(window).load(function() {

	gameState = 'wait';

});

