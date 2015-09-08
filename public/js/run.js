$(document).ready(function() {

	game.state = 'loading';
	
	renderer.state = "loading";
	
	game.then = Date.now();
	game.stateManager();

});