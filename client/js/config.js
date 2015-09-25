//make weapon.js, put spear and sword in there
//prevent duplicate notes
//allow various texts to appear for each note
//config probability definitions
//remove all non input key logic from InpuntManager
//remove socket emitting from other turn into functions
//remove non socket logic from socket.js
//move everything to server side eventually
//add tree lighting power
//player can self config powers
//bow and arrow
//start render x,y-s at the end of anothers
//onclick method to UI's
//organize things into one master array - objects//toRender//toCollide
//allow ghostmovment in master if you hold shift

//how do I prevent a player from doing more than one thing with the action button pressed down
//right now it will do the action that is called first, when so happens to be the action that is rendered first (and then overlapped)
//therefor the player will not be doing the action that they see being rendered because it is overlapped by later actions

new Note("steal1",
 ["If you manage to steal your opponent's wood, there is a considerable payoff."], {
	 prob: 1,
	 condition: 0
 }
);

new Note("dash1",
 ["Press Z to dash forward"], {
	prob: 1,
	condition: 0
 }
);

new Note("chat1", 
 ["Press ENTER to chat with nearby users"], {
	prob: 1,
	condition: 0
 }
);

new Note("spear",
 ["You can now press 'k' to wield a deadly spear."], {
	 prob: 1,
	 condition: 0,
	 action:{
		 func: user.givePower, args: ["spear"]
	 }
 }
);

new Note("spear2", ["You have picked up a spear. Press 'k' to use it, but be careful where you point it."], {
	prob: 1, condition: 0,
	action:{
		func: user.givePower,
		args: ["spear"]
	}
});

new Note("spear3", 
 ["Press 'k' to brandish your spear and then press 'k' again to hide it."], {
	 prob: 1,
	 condition: 0,
	 action:{
		 func: user.givePower,
		 args: ["spear"]
	 }
 }
);

new Note("text1",["Appearances can be deceiving...stay on guard"], {
	prob: 1,
	condition: 0}
);

new Note("disguise",
 ["You have picked up a disguise. Hold 'm' and then", 
  "press r,g or b to impersonate another team."], {
	  prob: 1,
	  condition: 0,
	  action:{
		   func: user.givePower,
	  		args: ["disguise"]
	  }
  }
); 

new Note("notes1", ["What sort of notes have your teammates read? Are they hiding something?"],{
	prob: 1,
	condition: 0
 }
); 

new Note("powerWeapon",
 ["Press 'k' to sheath and unsheathe a golden spear. This weapon can kill PAPA BEAR"], {
	 prob:1, 
	 condition: function(){
		  return !game.getPowerStats("powerWeapon").has
	 }, 
	 action:{
		 func: user.givePower, args: ["powerWeapon"]
	 } 
 }
); 

new Note("powerWeapon2", 
 ["Someone has a special spear that can kill PAPA BEAR"], {
	prob: 1,
	condition: function(){
		return game.getPowerStats("papaBear").has&&game.getPowerStats("powerWeapon").has
	}
 }
); 

new Note("powerWeapon3",
 ["Only the golden spear can defeat PAPA BEAR"], {
	 prob: 1,
	 condition: function(){
		 return game.getPowerStats("papaBear").has&&game.getPowerStats("powerWeapon").has
	 }
  }
); 

new Note("text2", ["Some notes can give you immense power. This note does not."], {
	prob: 1,
	condition: function(){
		 return !game.getPowerStats("papaBear").has
	}
 }
);

new Note("papaBear1",
 ["You are now Papa Bear"], {
	 prob: 2,
	 condition: function(){
		  return !game.getPowerStats("papaBear").has
	 }, 
	 action:{
		 func: user.givePower,
		 args: ["papaBear"]
	 }
  }
); 

renderer.styles = {
	"large": new Style("rgb(255,255,255)", {fontSize: 1.8, lineWidth: 1}),
	"block text": new Style("rgb(255,255,255)", {fontSize: .75, lineWidth: .2}),
	"note": new Style("rgb(255,255,255)", {fontSize: 1.5, lineWidth: .2}),
	"on top": new Style("rgb(0,0,0)", {fontSize: 1, lineWidth: .2, paddingX: .85, paddingY: .1}),	
	"notes": new Style("rgb(0,0,0)", {fontSize: 1, paddingX: .2, paddingY: .2}),	
	
}

new UI("big screen", {style: "block text",x: "/10", y: 100, width: "/1.2", height: "-100"}, {reset:false, startRender: false, 
	condition: function(){
			if(user.server.dead){
				this.item = "You will respawn soon";
				return true;
			}
			if(builder.rejected){
				this.item = "You cannot build here";
				return true;
			}
			return game.state !== "game";
		}
	}
);
new UI("game screen", {style: "block text", x: "/6", y: 200, width: "/1.3", height: "-200"}, {reset:false});
new UI("action prompt", {style: "large", x: "/4", y: "-100", width: "/2", height: "/1"}, {type: "block", reset:false}),
new UI("timer",  {style : "block text", x: "/30", y: "/15", width: "/5", height: "/8"}, {
		reset:false,
		item: function(){ return (game.timeLimit - game.currentSec) + " seconds remaining" },
	}
);
new UI("space bar", {style: "on top", x: "/2.4", y: "/1.20", width: "/6", height: "/10"}, { background: "spacebar", startRender: false});
new UI("notes", {style: "notes", x: "/1.65", y: "/1.20", width: "/6", height: "/10"}, 
	{ reset: false, type: "grid", rows: 8, cols:2, item: "rgb(0,0,255)", ref: user.notes });

//upload all images
var imageArray = ["bear",
"playershadow",
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
"spacebar"];

imageArray.forEach(function(image){
	renderer.upload(image);
});

var audioArray = ["bear", 
"swipe"];

audioArray.forEach(function(audio){
	soundscape.upload(audio);
});


var happy = false;
var sad = false;
inputManager.registerKey("T", {
	master: true, 
	once: true, 
	on: function(){ console.log("on") }, 
	off: function(){ console.log("off") }, 
	onCondition: function(){ return happy }, 
	offCondition: function(){ return sad },
	mode: "player",
	}
);

inputManager.registerKey("M", {
	master: true, 
	once: true, 
	mode: "all",
	on: function(){ 
			if(user.mode == "master" && user.server.name) user.mode = "player";
			else if(user.mode == "player") user.mode = "master";
		}, 
	}
);

inputManager.registerKey("N", {
	master: true, 
	once: true, 
	mode: "all",
	on: function(){ 
			socket.emit('confirm_name', { name: makeId() });
		}, 
	}
);

inputManager.registerKey(188, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
			var cur = user.mPlayers.indexOf(user.name);
			if(user.mPlayers[cur-1]) user.name = user.mPlayers[cur-1];
		}, 
	}
);

inputManager.registerKey(190, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
			var cur = user.mPlayers.indexOf(user.name);
			if(user.mPlayers[cur+1]) user.name = user.mPlayers[cur+1];
		}, 
	}
);

inputManager.registerKey(191, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
		for(var power in powers.index)
			if(powers.index.hasOwnProperty(power) && !powers.index[power].exclusive){
				user.givePower(power);
			}
		}, 
	}
);

//soundscape.playWhen("swipe", function(){ return user.server.weapon.state == "attacking" });
//soundscape.playFrom("bear", {x: 2000, y:2000});

//soundscape.broadcast("bear", 20)
//example of how to play a sound
//soundscape.play("bear");


//drawing things
renderer['game'] = function(){
	//you can pass an array, a single object with a draw function, or a function that grabs certain objects with draw functions
	renderer.drawAll([
		game.server,
	 	game.forAllTeams,
	 	game.client.trees,
	 	game.client.notes,
	 	game.client.objects,
	 	game.forAllPlayers,
		renderer.UI["timer"],
		renderer.UI["notes"],
		renderer.UI['space bar'],
		renderer.UI['game screen'],
		renderer.UI["big screen"],
		builder.draw
	]);
};

//or you can explicitly state what to draw (good for small little screens)
renderer["loading"] = function(){
	renderer.UI["big screen"].draw([
		"Loading..."
	]);
}

renderer["intro"] = function(style){
	renderer.UI["big screen"].draw([
		"There are three villages. You are " + user.name + " of the " + user.server.team + " village.",
		"Only one village will survive this harsh winter, so you must stockpile as much wood as you can.",
		"Learn how better to survive by searching the woods for notes.",
		"",
		"Good luck.",
		"Waiting for game to start...."
	]);
}
renderer["server"] = function(){
	renderer.UI["big screen"].draw([
		"Connecting to server..."
	]);
}

renderer["score"] = function(){
	var textArr = []
	game.forAllTeams(function(team){
			
		textArr.push(team.name + " : " + team.score);
			
	});
	this.UI["big screen"].draw(textArr);
}

renderer['clear_frame'] = function(){
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0, canvas.width, canvas.height);
}


