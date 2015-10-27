socket.on('name_confirmed', function(data) {
	
	console.log(data.player);
	user.server = data.player;
	user.name = data.player.name;
	
	if(user.master){
		user.mPlayers.push(data.player.name)
		if(user.mode = "master") user.mode = "player";
	} 
	
	user.confirmed = true;
});

socket.on('startgame_client', function(data) {

	game.server = data.game;
	game.saved.grid = data.grid;
	game.saved.objects = data.objects;
	
	game.started = true;

	if(user.mode == "player") user.server = game.findUser();

	console.log("game started by server");
	
});

socket.on('stealTotal', function(data) {
	
	user.log.wood = data.total;
	
});


socket.on('noteSpawn', function(data) {
	
	game.saved.grid[data.gridCoords.x][data.gridCoords.y].contains.removed = false;
	
});


socket.on('update_clients', function(data) {
	if(!user.confirmed || game.state !== "game") return;

	game.packets.push(data);

	// game.stateManager();
		
});

socket.on('play_sound', function(data) {
	console.log("playing", data.sound);
	soundscape.playFrom(data.sound, data.coords, data.level);
		
});

socket.on('add_object', function(data) {
	game.saved.objects.push(data)
});

socket.on('remove_object', function(data) {

	game.saved.objects[data.index].removed = true;
	
});

socket.on("death", function(data){

	soundscape.broadcast("hit", 8);

	user.killer = data.killer;

	user.notes.filter(function(id){
		return !noteIndex[id].resetOnDeath;
	});
	
	user.log.has = false;

	if(user.log.stolen){
	
		user.log.stolen = false;
				
		chatController.submit(user.log.wood);

		socket.emit("depLog", {team: user.log.stolenFrom, name: user.name, amount: user.log.wood})

		user.log.stolenFrom = "";
	}

});

socket.on('treeChopped', function(data) {
		
	game.saved.grid[data.gridCoords.x][data.gridCoords.y].contains.removed = true;

});

socket.on('noteGot', function(data) {

	game.saved.grid[data.gridCoords.x][data.gridCoords.y].contains.removed = true;
		
});

socket.on('kill', function(data) {
	renderer.UI["big screen"].forceRender = true;
	renderer.UI["big screen"].item = "You killed " + data.reactant;		
});


socket.on('placement_result', function(data) {
	if(data.success) builder.place();
	else builder.reject();
});