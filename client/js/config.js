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

renderer.UI = {
	"big screen" : new UI("block text", {x: "/10", y: 100, width: "/1.2", height: "-100"}),
	"game screen" : new UI("block text", {x: "/6", y: 200, width: "/1.3", height: "-200"}),
	"action prompt" : new UI("large", {x: "/4", y: "-100", width: "/2", height: "/1"}),
	"timer" : new UI("block text", {x: "/30", y: "/15", width: "/5", height: "/8"}),
	"space bar" : new UI("on top", {x: "/2.4", y: "/1.20", width: "/6", height: "/10"}),	
	"notes" : new UI("notes", {x: "/1.65", y: "/1.20", width: "/6", height: "/10"}),	
}

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


