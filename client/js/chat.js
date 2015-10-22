var chatController = { started:false };

chatController.process = function(){
	if(!this.started){
		this.show();
	}else{
		this.submit();
	}

}

chatController.show = function(){

	this.started = true;
	game.mode = "chat";

	$('#chatView').show();
	$('#chatInput').focus();
}

chatController.submit = function(text, time){

	this.started = false;
	game.mode = "player";

	$('#chatView').hide();
	
	//$('#game').focus();
	
	if(!time) time = 5000;
	
	if(!text) chatMessage = $('#chatInput').val();
	else chatMessage = text;
	
	$('#chatInput').val("");
	
	if(chatMessage != "") socket.emit("sendChat", {message: chatMessage, name: user.name, time: time});
	
}