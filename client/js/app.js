//connect to sockets on server


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

window.onbeforeunload = function (e) {
 	socket.emit("left_game", {name: user.name});
};