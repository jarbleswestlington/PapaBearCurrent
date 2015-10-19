//allow various render contexts
//change key direction from UPLEFTDOWNRIGHT to ULDR for consistency
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
//allow ghostmovment in master if you hold shift


new Note("steal1",
 ["If you find another village", 
 "you can make off with a large chunk of their wood."], {
	 prob: 2,
	 condition:function(){game.getCurrentSec() <= 180}
 }
);

new Note("build",
 ["By pressing 'w' you can place a barrier using whatever wood you are currently holding"], {
	 prob: 2,
	 condition:function(){game.getCurrentSec() <= 180}
 }
);

new Note("empty",
 ["This chest is empty"], {
	 prob: 1,
	 condition: 0,
	 once: false
 }
);


new Note("dash1",
 ["Press Z to preform a dash."], {
	prob: 1,
	condition: 0
 }
);

new Note("chat1", 
 ["Press ENTER to type messages to nearby players."], {
	prob: 2,
	condition:function(){game.getCurrentSec() <= 180}
 }
);

new Note("sword",
 ["You have picked up a sword.",
 " Press 'shift' to swing it."], {
	 prob: 3,
	 condition: 0,
	 action:{ func: user.givePower, args: ["sword"]},
 }
);

new Note("spear", ["You have picked up a spear.",
	"Press 'shift' to hold it and 'shift' again to hide it."], {
	prob: 3,
	condition: 0,
 	action:{
		 func: user.givePower, args: ["spear"],
		 resetOnDeath: true
		 //also should not have spear
	 }
 }
);

new Note("text1",["Appearances can be deceiving...stay alert."], {
	prob: 2,
	condition:function(){ return game.getCurrentSec() >= 180 && game.getCurrentSec() <= 360}
 }
);

new Note("disguise",
 ["You have picked up a disguise.", 
  "press r,g, or b to impersonate another team."], {
	  prob: 1,
	  condition:function(){ return game.getCurrentSec() >= 180},
	  action:{
		    func: user.givePower,
	  		args: ["disguise"]
	  		//also Game.currentsec > 180,
	  }
  }
); 

new Note("powerWeapon",
 ["Press 'shift' to sheath and unsheathe a golden spear. This weapon can kill PAPA BEAR"], {
	 prob:1, 
	 condition: function(){ return game.getCurrentSec() >= 360 && !game.getPowerStats("powerWeapon").has },
	 action:{
		 func: user.givePower, args: ["powerWeapon"]
	 } 
 }
); 

new Note("powerWeapon2",
 ["Only the golden spear can defeat PAPA BEAR"], {
	 prob: 1,
	 condition: function(){return game.getCurrentSec() >= 360 && !game.getPowerStats("papaBear").has }
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
	 condition: function(){return game.getCurrentSec() >= 360 && !game.getPowerStats("papaBear").has },
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
	"image": new Style("rgb(0,0,0)", {fontSize: 1, lineWidth: .2, paddingY: -.9}),	
	"imageWhite": new Style("rgb(255,255,255)", {fontSize: 1, lineWidth: .2, paddingY: -.9}),	


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
new UI("game screen", {style: "block text", x: "/6", y: 100, width: "/1.3", height: "-200"}, {reset:false});
new UI("action prompt", {style: "large", x: "/4", y: "-100", width: "/2", height: "/1"}, {type: "block", reset:false}),
new UI("timer",  {style : "block text", x: "/30", y: "/15", width: "/5", height: "/8"}, {
		reset:false,
		item: function(){ return (game.timeLimit - game.currentSec) + " seconds remaining" },
	}
);

new UI("wood counter", {style: "imageWhite", x: "-200", y: "/1.20", width: 90, height: "/10"}, { background: "pile", startRender: true, reset: false,
	condition: function(){
		if(!user.server.powers) return;
		if(!user.server.powers.papaBear){
			this.item = user.server.log.wood.toString();
			return true;
		}
	}
});

new UI("space bar", {style: "on top", x: 200, y: "/1.20", width: "/6", height: "/10"}, { background: "spacebar", startRender: false});

new UI("shift key", {style: "image", x: 100, y: "/1.20", width: 70, height: "/10"}, { background: "spacebar", reset: false, startRender: true,
	condition: function(){
		if(!user.server.powers) return false;

		if(user.server.powers.powerWeapon){
			this.item = "spearPDia"
			return true;
		}
		if(user.server.powers.sword){
			this.item = "swordDia"
			return true;
		}
		if(user.server.powers.spear){
			this.item = "spearDia"
			return true;
		}
	},
});


new UI("notes", {style: "notes", x: "/1.65", y: "/1.20", width: "/6", height: "/10"}, 
	{ reset: false, type: "grid", rows: 2, cols:8, item: "rgb(0,0,255)", ref: user.notes });

//upload all images
var imageArray = ["bear",
"playershadow",
"swordDrop",
"spearDrop",
"swordR",
"swordL",
"swordD",
"swordU",
"spearR",
"spearL",
"spearD",
"spearU",
"spearPR",
"spearPL",
"spearPD",
"spearPU",
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
"spacebar",
"spearDia",
"spearPDia",
"swordDia",
"hedgehog",
"chest"];

imageArray.forEach(function(image){
	renderer.upload(image);
});

var audioArray = ["bear", 
"swipe", 
"chop",
"pickUp",
"emptyChest",
"hit"];

audioArray.forEach(function(audio){
	soundscape.upload(audio);
});

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
			socket.emit('confirm_name', { name: tools.makeId(6), master: true });
	},
});

inputManager.registerKey(188, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
			var cur = user.mPlayers.indexOf(user.name);
			if(user.mPlayers[cur-1]) user.name = user.mPlayers[cur-1];
	} 
});

inputManager.registerKey(190, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
			var cur = user.mPlayers.indexOf(user.name);
			if(user.mPlayers[cur+1]) user.name = user.mPlayers[cur+1];
	}
});

inputManager.registerKey(191, {
	master: true, 
	once: true, 
	mode: "player",
	on: function(){ 
		socket.emit("give_power", {name: user.name, power:"powerWeapon"});
	}
});

inputManager.registerKey(87, {
	once: true, 
	mode: "player",
	on: function(){ 
		builder.start("wall");
	},
	onCondition: function(){
		return user.server.log.has;
	},
	off: function(){
		builder.request();
	},
	offCondition: function(){
		return builder.on;
	},
});


//view the soundscape.playFrom function to see a guide to what level you should pass into the third arguments
//soundscape.playWhen("swipe", function(){ return user.server.weapon.state == "attacking" });
//soundscape.playFrom("bear", {x: 2000, y:2000});

//soundscape.broadcast("bear", 20)
//example of how to play a sound
//soundscape.play("bear");


//drawing things
renderer['game'] = function(){
	//you can pass an array that contains items that have draw functions
	//you can pass a single object with a draw function, 
	//or you can pass a function that grabs certain objects with draw functions
	renderer.drawAll([
		game.server,
	 	game.forAllTeams,
	 	game.saved.objects,
	 	game.forAllPlayers,
		renderer.UI["timer"],
		renderer.UI['space bar'],
		renderer.UI['game screen'],
		renderer.UI["big screen"],
		renderer.UI["shift key"],
		renderer.UI["wood counter"],
		builder
	]);
	//to edit whats happening
	//find the draw funtions either on the server instance or the saved instance of these objects
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


