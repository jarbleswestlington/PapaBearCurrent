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
 ["If you find another village's base", 
 "you can make off with a large chunk of their wood."], {
	 prob: 4,
	 condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("steal2",
 ["If a theif steals wood from your base", 
 "kill them before they escape and your wood will be returned."], {
	 prob: 4,
	 condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("survival",
 ["If a team runs out of wood", 
 "They will be unable to respawn."], {
	 prob: 4,
	 condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("teamwork",
 ["If you drop wood at another teams base they get twice as much wood", 
 "maybe you can convince them to do the same for you?"], {
	 prob: 1,
	 condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("revival",
 ["You can revive a dead team by dropping wood off at their base",
 "wood dropped at an enemy base is worth twice as much"],  {
	 prob: 2,
	 condition:function(){ return game.getCurrentSec() >= 400},
 }
);

new Note("build",
 ["By pressing 'D' you can place a barrier using whatever wood you are carrying"], {
	 prob: 3,
	 condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("chat1", 
 ["Press 'ENTER' to type to nearby players."], {
	prob: 3,
	condition:function(){ return game.getCurrentSec() <= 180}
 }
);

new Note("disguise",
 ["You have picked up a disguise.", 
  "press 'S' to impersonate another team."], {
	  prob: 2,
	  condition:function(){ return game.getCurrentSec() >= 60},
	  action:{
		    func: user.givePower,
	  		args: ["disguise"]
	  }
  }
); 

new Note("telescope",
 ["You have picked up a telescope", 
  "press 'S' to equip and the arrow keys to move the camera, press 'S' to return."], {
	  prob: 2,
	  condition:0,
	  action:{
		    func: user.givePower,
	  		args: ["telescope"]
	  }
  }
); 

new Note("text1",
	["Appearances can be deceiving...be on your guard for imposters."], {
	prob: 2,
	condition: 0,
 }
);

new Note("empty",
	["This chest is empty"], {
	prob: 1,
	condition: 0,
	once: false
 }
);

new Note("time",
	["The items in chests will change depending on how much time has passed.", 
	"Patience will be rewarded."], {
	prob: 1,
	condition: 0,
 }
);

new Note("text2", 
	["Some notes can give you immense power. This note does not."], {
	prob: 1,
	condition: function(){ return !game.getPowerStats("papaBear").has},
 }
);

new Note("Earlyspear", 
	["You have picked up a spear.",
	"Press 'A' to switch between equipping or hiding it."], {
	prob: 1,
	condition: function(){ return !game.getPowerStats("spear").had && game.getCurrentSec() <= 149},
 	action:{
		 func: user.givePower, args: ["spear"]
	 }
 }
);

new Note("dash1",
 ["You have picked up magic boots.",
 "Press 'S' to preform a dash."], {
	prob: 3,
	condition:function(){ return game.getCurrentSec() >= 100},
   	action:{
		    func: user.givePower,
	  		args: ["dash"]
	  		//also Game.currentsec > 180,
	  }
	}
);

new Note("sword",
 ["You have picked up a sword.",
 " Press 'A' to swing it."], {
	 prob: 3,
	 condition:function(){ return game.getCurrentSec() >= 150},
	 action:{ func: user.givePower, args: ["sword"]},
 }
);

new Note("spear", ["You have picked up a spear.",
	"Press 'A' to switch between equipping or hiding it."], {
	prob: 3,
	condition:function(){ return game.getCurrentSec() >= 150},
 	action:{
		 func: user.givePower, args: ["spear"],
		 resetOnDeath: true
		 //also should not have spear
	 }
 }
);

new Note("powerWeapon",
 ["Press 'A' to sheath and unsheathe a golden spear. This weapon can kill Papa Bear"], {
	 prob:2, 
	 condition: function(){ return game.getCurrentSec() >= 360 && !game.getPowerStats("powerWeapon").has && !game.getPowerStats("papaBear").teamHas },
	 action:{
		 func: user.givePower, args: ["powerWeapon"]
	 } 
 }
); 

new Note("powerWeapon2",
 ["Only the golden spear can defeat Papa Bear"], {
	 prob: 3,
	 condition: function(){return game.getCurrentSec() >= 360 && !game.getPowerStats("papaBear").has },
  }
); 


new Note("papaBear1",
 ["You are now Papa Bear"], {
	 prob: 2,
	 condition: function(){return game.getCurrentSec() >= 360 && !game.getPowerStats("papaBear").had && !game.getPowerStats("powerWeapon").teamHas },
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
	"on top": new Style("rgb(80,80,80)", {fontSize: 1, lineWidth: .2, paddingX: .85, paddingY: .1}),	
	"notes": new Style("rgb(0,0,0)", {fontSize: 1, paddingX: .2, paddingY: .2}),	
	"image": new Style("rgb(0,0,0)", {fontSize: "60", paddingY: "-60"}),	
	"imageWhite": new Style("rgb(255,255,255)", {fontSize: 1, lineWidth: .2, paddingY: -.9}),	
}

new UI("big screen", {style: "block text",x: "/10", y: 100, width: "/1.2", height: "-100"}, {reset:false, startRender: false, 
	condition: function(){
			if(builder.rejected){

				this.item = "You cannot build here";
				return true;

			}else if(user.server.dead){

				this.item = [];
				this.item.push("It costs 250 wood to respawn");
				if(user.server.willRespawn){
					this.item.push("Your team has enough wood");
					this.item.push("You will respawn soon");
				} 
				else this.item.push("Your team does not have enough wood");

				if(user.killer) this.item.push("You were killed by " + user.killer);
				this.forceRender = false;
				return true;

			}else if(this.forceRender){
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

new UI("wood counter", {style: "imageWhite", x: "-200", y: "-125", width: 90, height: 70}, { background: "pile", startRender: true, reset: false,
	condition: function(){
		if(!user.server.powers) return;
		if(!user.server.powers.papaBear){
			this.item = user.server.log.wood.toString();
			return true;
		}
	}
});

new UI("space bar", {style: "on top", x: 280, y: "-125", width: "/6", height: 70}, { background: "spacebar", startRender: false});

new UI("c key", {style: "image", x: 200, y:  "-125", width: 70, height: 70}, { background: "dkey", reset: false, startRender: true,
	condition: function(){
		if(!user.server.powers) return false;

		if(user.server.powers.hammer && user.server.log.has){
			this.item = "hammerDia";
			return true;
		}
		
	},
});


new UI("x key", {style: "image", x: 120, y:  "-125", width: 70, height: 70}, { background: "skey", reset: false, startRender: true,
	condition: function(){
		if(!user.server.powers) return false;

		if(user.server.powers.disguise){
			this.item = "disguise";
			return true;
		}
		if(user.server.powers.invisibility){
			this.item = "cloak";
			return true;
		}
		if(user.server.powers.telescope){
			this.item = "telescope";
			return true;
		}
		if(user.server.powers.dash){
			this.item = "dashboots";
			return true;
		}
		
	},
});

new UI("z key", {style: "image", x: 40, y:  "-125", width: 70, height: 70}, { background: "akey", reset: false, startRender: true,
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
"sworddrop",
"speardrop",
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
"chest",
"akey",
"skey",
"hammerDia",
"cloak",
"disguise",
"telescope",
"dashboots",
"dkey",
"bearStatue",
"footprint",
"counter"];

imageArray.forEach(function(image){
	renderer.upload(image);
});

var audioArray = ["bear", 
"swipe", 
"chop",
"pickUp",
"emptyChest",
"hit",
"build",
"step1",
"step2"];

audioArray.forEach(function(audio){
	soundscape.upload(audio);
});


inputManager.registerKey("A", {
	once: true, 
	mode: "player",
	on: function(){ 
			if(inputManager.pressable.shift && user.server.weapon.state == "ready" && user.server.powers.sword){
				user.usePower("sword");
			}
			if(user.server.powers.spear){
				user.usePower("spear");
			}

		}, 
	}
);

inputManager.registerKey("S", {
	once: true, 
	mode: "player",
	on: function(){ 

			if(user.server.powers.disguise){
				user.usePower("disguise");
			}
			if(user.server.powers.dash){
				console.log(user.dashing);
				user.dash();
			}
			if(user.server.powers.telescope){
				user.usePower("telescope");
			}
		}, 
	}
);


inputManager.registerKey("D", {
	once: true, 
	mode: "player",
	on: function(){ 
		builder.start("wall");
	},
	onCondition: function(){
		return user.server.log.has && user.server.powers.hammer && !user.server.log.stolen;
	},
	off: function(){
		builder.request();
	},
	offCondition: function(){
		return builder.on;
	},
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
		if(user.server && game.server.test) socket.emit("left_game", {name: user.server.name});
		socket.emit('confirm_name', { name: tools.makeId(6), master: true });
	},
});

inputManager.registerKey(188, {
	master: true, 
	once: true, 
	mode: "player",
	onCondition: function(){ return !game.live },
	on: function(){ 
		var cur = user.mPlayers.indexOf(user.name);
		if(user.mPlayers[cur-1]) user.name = user.mPlayers[cur-1];
	} 
});

inputManager.registerKey(190, {
	master: true, 
	once: true, 
	mode: "player",
	onCondition: function(){ return !game.live },
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


inputManager.registerKey(13, {
	once: true, 
	mode: "all",
	onCondition: function(){
		return user.server.host && game.state == "waiting";
	},
	on: function(){ 
		socket.emit("startgame_server", {});
	}
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
	 	game.forAllPlayers,
	 	game.saved.objects,
		renderer.UI["timer"],
		renderer.UI['space bar'],
		renderer.UI['game screen'],
		renderer.UI["big screen"],
		renderer.UI["z key"],
		renderer.UI["x key"],
		renderer.UI["c key"],
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
	var text = [
		"There are three villages. You are " + user.name + " of the " + user.server.team + " village.",
		"Only one village will survive this harsh winter, so you must stockpile as much wood as you can.",
		"Learn how better to survive by searching the woods for notes.",
		"",
		"Good luck.",
		"",
	]

	if(user.server.host){

		text.push("There are " + Object.keys(game.server.players).length + " players ready to play");
		text.push("You are the host. When everyone is ready, press enter to start the game!");

	}else{

		text.push("Waiting for game to start....");

	}


	renderer.UI["big screen"].draw(text);
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


