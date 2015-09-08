module.exports = function(game){
	
	var http = require('http');
	var app = require("express")();
		
	require("./routes/index")(app, game);

	return app;
}

