
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomArbitrary( numone,  numtwo) {
	return Math.floor(Math.random() * (numtwo - numone) + 1);
}

//setUp Game object;
var game = {
	
	connected:false,
	gameState:"init",
	timeLimit:720,
	currentSec:0,
	server:null,
	client:{
		trees:[],
		notes:[]
	},
	
};

game.getCurrentSec = function(){
	
	return this.currentSec;
};

game.forAllTrees = function(func){

	for(var i = 0; this.client.trees.length; i++){
		func(this.client.trees[i].length);
	}
}

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

game.colCheck = function(smaller, bigger, padding){
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
	
	if( (smaller.x >= bigger.x + padding.x && smaller.x <= bigger.x + bigger.width - padding.x) || (smaller.x + smaller.width >= bigger.x + padding.x && smaller.x + smaller.width <= bigger.x + bigger.width - padding.x) ){

       if( (smaller.y >= bigger.y + padding.y && smaller.y <= bigger.y + bigger.height - padding.y) || (smaller.y + smaller.height >= bigger.y + padding.y && smaller.y + smaller.height <= bigger.y + bigger.height - padding.y) ){

           return true;
       }

   }
	
}

game.colCheckRelative = function(smallerGroup, biggerGroup, padding){
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
	
	if(biggerGroup.item) biggerGroup = {x: biggerGroup.item.x + biggerGroup.influencer.x, y: biggerGroup.item.y + biggerGroup.influencer.y, width: biggerGroup.item.width, height: biggerGroup.item.height};

	if(smallerGroup.item) smallerGroup = {x: smallerGroup.item.x + smallerGroup.influencer.x, y: smallerGroup.item.y + smallerGroup.influencer.y, width: smallerGroup.item.width, height: smallerGroup.item.height};

	return this.colCheck(smallerGroup, biggerGroup, padding);
}

game.checkCollision = function(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;
       }

   }
   
   return false;
}

game.getPowerStats = function(power){
	
	var stats = {has: false, total :0};
	
	game.forAllPlayers(function(player){
		
		if(player.powers[power]){
			stats.total++;
			stats.has = true;
		}
		
	});
	
	return stats;
}

game.findUser = function(){
	
	var playerGot;
	
	this.forAllPlayers(function(player){

		if(player.name == user.name) playerGot = player;

	});
	
	return playerGot;
}

game.update = function (modifier) {
	
	user.move(modifier);
	user.interactWBase();
	user.interactWTree();
	user.interactWNote();
	user.interactWObject();
	
	renderer.updateCamera();
	
};

game.stateManager = function () {

    var now = Date.now();
    var delta = now - this.then;
	
	renderer.draw['clear_frame']();
	
	if(user.name == "master") inputManager.masterKeys(delta/1000);
      
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
  
	    if(user.name != "master"){	
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
	
	if(renderer.draw[renderer.state]) renderer.draw[renderer.state].call(renderer);
	
	this.then = now;
	
	soundscape.checkToPlay();

	animate(game.stateManager);
	     
};