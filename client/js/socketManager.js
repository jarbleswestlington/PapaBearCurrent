socket.on('name_confirmed', function(data) {
	
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
	game.client.trees = data.trees;
	game.client.notes = data.notes;
	game.client.objects = data.objects;
	
	game.started = true;

	console.log("game started by server");
	
});

socket.on('stealTotal', function(data) {
	
	user.log.wood = data.total;
	
});



socket.on('update_clients', function(data) {
	if(!user.confirmed) return;

	$.extend(true, game.server, data.update);

	if(user.mode == "player") user.server = game.findUser();

	game.currentSec = data.time;
		
});

socket.on('play_sound', function(data) {

	soundscape.playFrom(data.sound, data.coords, data.level);
		
});

socket.on('add_object', function(data) {
	game.client.objects.push(data)
});

socket.on('remove_object', function(data) {

	game.client.objects[data.index].removed = true;
	
});

socket.on("death", function(data){
	

	user.notes.filter(function(id){
		return !notesIndex[id].resetOnDeath;
	});
	
	user.log.has = false;

	if(user.log.stolen){
	
		user.log.stolen = false;
				
		chatController.submit(user.log.wood);

		socket.emit("depLog", {team: user.log.stolenFrom, name: user.name, amount: user.log.wood})

		user.log.stolenFrom = "";
	}

})

socket.on('treeChopped', function(data) {
		
	game.client.trees[data.number].removed = true;

});

socket.on('noteGot', function(data) {

	game.client.notes[data.number].removed = true;
		
});

socket.on('placement_result', function(data) {
	if(data.success) builder.place();
	else builder.reject();
});