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

	$('#chatView').show();
	$('#chatInput').focus();
}

chatController.submit = function(text, time){
	console.log("submitted");
	this.started = false;

	$('#chatView').hide();
	
	//$('#game').focus();
	
	if(!time) time = 5000;
	
	if(!text) chatMessage = $('#chatInput').val();
	else chatMessage = text;
	
	$('#chatInput').val(" ");
	
	if(chatMessage != "") socket.emit("sendChat", {message: chatMessage, name: user.name, time: time});
	
}