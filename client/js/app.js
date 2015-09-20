//render style
//socket organization
//html organization
//make multiple files
//dashing not working
//check stealing
//allow various render contexts
//pass in any object into a render function//draw function on all objects
//change key direction from UPLEFTDOWNRIGHT to ULDR for consistency

//connect to sockets on server
var socket = io.connect(window.location.hostname);
socket.on('connect', function(data) {
	
	if(!user.master) socket.emit("confirm_name", {name: user.name});
	else user.confirmed = true;
});
socket.on('error', function() { console.error(arguments) });
socket.on('message', function() { console.log(arguments) });  

// Create the canvas in the html
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.setAttribute("id", "game");
document.body.appendChild(canvas);

$(document).ready(function() {

	game.state = 'loading';
	
	renderer.state = "loading";
	
	game.then = Date.now();
	game.stateManager();

});