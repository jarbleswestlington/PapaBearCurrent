//setUp Game object;
var game = {
	
	connected:false,
	gameState:"init",
	timeLimit:720,
	currentSec:0,
	server:null,
	saved:{
		trees:[],
		notes:[]
	},

	packetsSentSinceUpdate: 0,

	packets: [],
	packetLimit: 5,
	
};

game.getCurrentSec = function(){
	
	return this.currentSec;
};

game.forAllTrees = function(func){

	for(var i = 0; game.saved.trees.length; i++){
		func(game.saved.trees[i].length);
	}
}

game.forAllPlayers = function(func){
	
	for(var name in game.server.players){	
		var player = game.server.players[name];
		if(player.removed) continue;
		func(player);
	}
	
}

game.forAllTeams = function(func){

	for(var name in game.server.teams){

		func(game.server.teams[name]);

	}

}

game.getPowerStats = function(power){
	
	var stats = {has: false, current:0, had: false, teamHas: false};
	
	game.forAllPlayers(function(player){
		
		if(player.powers[power]){
			if(player.team == user.team) stats.teamHas = true;
			stats.current++;
			stats.has = true;
		}
		
	});
	
	var serverStats = game.server.powerStats[power];

	if(serverStats){
		stats.had = serverStats.had;
		stats.total = serverStats.total;
	}

	return stats;
}

game.findUser = function(name){
	
	if(!name) name = user.name;
	
	var playerGot;

	
	this.forAllPlayers(function(player){

		if(player.name == name) playerGot = player;

	});

	return playerGot;
}

game.readyForMovement = function(){

	var limit = game.packetLimit;
	if(game.server.testing){
		limit = limit * Object.keys(game.server.players).length;
	}

	// console.log(limit, game.server.players.length)

	if(game.packetsSentSinceUpdate < limit) return true;
}

game.processUpdatePackets = function(){
	if(!game.packets.length) return;

	var data;

	while(this.packets.length){
		var data = this.packets.shift();
		$.extend(true, game.server, data.update);
	}

	if(user.mode == "player") {
		var playerUpdated = game.findUser();
		if(playerUpdated) user.server = playerUpdated;
	}

	game.currentSec = data.time;
}

game.update = function (modifier) {
	
	if(builder.on) user.action = false;

	game.processUpdatePackets();

	user.move(modifier);
	user.interactWBase();
	user.checkNearbyGridNodes();
	user.checkNearbyObjects();

	user.processActionQueue();

	renderer.updateCamera();
};

game.stateManager = function () {

    var now = Date.now();
    var delta = now - this.then;
	
	renderer['clear_frame']();
	
	if(user.mode == "master") inputManager.masterKeys(delta/1000);
      
	if(game.state == "loading"){
		
		if(renderer.hasLoaded() && soundscape.hasLoaded()) game.state = "waiting";

	}
   
	if(game.state == "waiting"){
		

		if(user.confirmed){

			renderer.state = "intro";

			
		}else{
			
			renderer.state = "server";

		}
				  

		if(game.started) game.state = "game";

	}	   

	if(game.state == "game" && game.server){
  
	    if(user.mode == "player"){	
			inputManager.processInput(delta/1000);
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
	
	if(renderer[renderer.state]) renderer[renderer.state].call(renderer);
	
	renderer.reset();
	
	soundscape.check();
	
	inputManager.clear();
	
	this.then = now;
	
	animate(game.stateManager);
	     
};