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
		if(player.removed) {

			console.log("hes gone!");
			continue;
		}
		func(player);
	}
	
}

game.forAllTeams = function(func){

	for(var name in game.server.teams){

		func(game.server.teams[name]);

	}

}

game.getPowerStats = function(power, player){
	
	var stats = {has: false, total :0, had: false};
	stats.player = {has: false, had: false};
	
	game.forAllPlayers(function(player){
		
		if(player.powers[power]){
			stats.total++;
			stats.has = true;
		}
		
	});
	
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

game.update = function (modifier) {
	
	if(builder.on) user.action = false;

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
	
	if(renderer[renderer.state]) renderer[renderer.state].call(renderer);
	
	renderer.reset();
	
	soundscape.check();
	
	inputManager.clear();
	
	this.then = now;
	
	animate(game.stateManager);
	     
};