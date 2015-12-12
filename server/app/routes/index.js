module.exports = function(app, game){

	var fs = require('fs');
	var express = require("express");
	
	app.use(express.static('./client'));

	var play = fs.readFileSync('./client/play.html');
	var index = fs.readFileSync('./client/index.html');


	app.get('/', function (req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});

		var pName = req.params.name;

		if(!game.hasPlayer(pName)){
			if(pName !== "master") game.addPlayer(pName);
		}else{
			game.playersCount++;
			game.addUpdate("playersCount");
		   	var player = game.findPlayerByName(pName);
		   	player.removed = false;
		}

		res.write(play);
		res.end();

	});

	app.get('/player/:name', function (req, res){
		res.writeHead(200, {'Content-Type': 'text/html'});

		var pName = req.params.name;

		if(!game.hasPlayer(pName)){
			if(pName !== "master") game.addPlayer(pName);
		}else{
			game.playersCount++;
			game.addUpdate("playersCount");
		   	var player = game.findPlayerByName(pName);
		   	player.removed = false;
		}

		res.write(play);
		res.end();

	});

	app.get('/api/game/started', function (req, res){
		res.json({started: game.started});
	});

	app.get('/master', function (req, res){

		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write(play);
		res.end();
	});

	// app.get('/app/player/:name', function (req, res){
	// 	res.writeHead(200, {'Content-Type': 'text/html'});

	// 	var pName = req.params.name;

	// 	var player = game.findPlayerByName(pName);

	// 	player.renderteam = "green";
	// 	player.x += 50;


	// 	res.end();

	// });
	
	
}