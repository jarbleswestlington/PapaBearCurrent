module.exports = function(app, game){

	var fs = require('fs');
	var express = require("express");
	
	app.use(express.static('./client'));

	var index = fs.readFileSync('./client/index.html');

	app.get('/player/:name', function (req, res){
	   res.writeHead(200, {'Content-Type': 'text/html'});

	   var pName = req.params.name;
   
	   if(!game.hasPlayer(pName)){
	   		  console.log("finding player 3")

	 		game.addPlayer(pName, pName == "master" ? true : false);
	   }else{
	   		console.log("finding player 2")

		   	var player = game.findPlayerByName(data.name);
		   	player.removed = false;
	   }
	   res.write(index);
			console.log("finding player 1")

	   res.end();

	});

	app.get('/master', function (req, res){
	   res.writeHead(200, {'Content-Type': 'text/html'});

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