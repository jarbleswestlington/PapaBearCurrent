module.exports = function(app, game){

	var fs = require('fs');
	var express = require("express");
	
	app.use(express.static('./client'));

	var index = fs.readFileSync('./client/index.html');

	app.get('/player/:name', function (req, res){
	   res.writeHead(200, {'Content-Type': 'text/html'});

	   var pName = req.params.name;
   
	   if(!game.hasPlayer(pName)) game.addPlayer(pName, pName == "master" ? true : false);

	   res.write(index);

	   res.end();

	});
	app.get('/app/player/:name', function (req, res){
	   res.writeHead(200, {'Content-Type': 'text/html'});

	   var pName = req.params.name;
   
		var player = game.findPlayerByName(pName);
		
		player.renderteam = "green";
		player.x += 50;
		

	   res.end();

	});
	
	
}