//get animation function (used for game loop)
var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;

//setUp Renderer
var renderer = {
	refs:{},
	camera : {
	
		x:0,
		y:0
	},
	
	state : "init",
	treeText: false,
	stealText: false,

	currentNote : {},
	
	showNote: false,
};

renderer.upload = function(src){
	var newImg = new Image();
	newImg.src = "/images/" + src + ".png";
	this.refs[src] = newImg;
	this.refs[src].onload = function(){
		
		this.loaded = true;
		
	}.bind(this.refs[src]);
}

renderer.updateCamera = function(){
	
	this.camera.y = canvas.height/2 - user.server.y;
	this.camera.x = canvas.width/2 - user.server.x;
};

renderer.drawImage = function(image, coordX, coordY){
	if(typeof image == "object") this.drawImage(image.image, image.x, image.y);
	else ctx.drawImage(this.refs[image], coordX + this.camera.x, coordY + this.camera.y);
};

renderer.drawImageRelative = function(item , influence){
	var newItem = {};
	newItem.x = item.x + influence.x;
	newItem.y = item.y + influence.y;
	newItem.image = item.image;
	this.drawImage(newItem);
	
}

renderer.drawSprite = function(image, coordX, coordY, sprite){
	
	ctx.drawImage(this.refs[image], sprite.x, sprite.y, sprite.width, sprite.height, coordX + this.camera.x, coordY + this.camera.y, sprite.width, sprite.height
	);

};

renderer.drawRect = function(color, coordX, coordY, width, height){
	
	ctx.fillStyle = color;
	ctx.fillRect(coordX + this.camera.x, coordY + this.camera.y, width, height);
};
	
renderer.fillText = function(text, coordX, coordY){

	ctx.fillText(text, coordX + this.camera.x, coordY + this.camera.y);

}

renderer.playerText = function(player){
	ctx.font = '20px Helvetica';
	ctx.fillStyle = "rgb(255,255,0)";
	
	text = player.chatText.toString().match(/.{0,30}(\s|$)/g)
	
	text.forEach(function(line, i){
		this.fillText(line, player.x + (player.width/2) - (ctx.measureText(line).width/2) , player.y - (21 * (text.length - i -2)) - 10);
		
	}.bind(this));
	
};

renderer.draw = {};

renderer.draw["loading"] = function(){
	this.UI["big screen"].draw([
		"Loading..."
	]);
}	

renderer.draw["intro"] = function(style){
	
	this.UI["big screen"].draw([
		"There are three villages. You are " + user.name + " of the " + user.server.team + " village.",
		"Only one village will survive this harsh winter, so you must stockpile as much wood as you can.",
		"Learn how better to survive by searching the woods for notes.",
		"",
		"Good luck.",
		"Waiting for game to start...."
	]);
	
}

renderer.draw["server"] = function(){

	this.UI["big screen"].draw([
		"Connecting to server..."
	]);
	
}

renderer.draw["score"] = function(){
	

	var textArr = []
	
	game.forAllTeams(function(team){
			
		textArr.push(team.name + " : " + team.score);
			
	});
	
	this.UI["big screen"].draw(textArr);
	

}

renderer.draw["end"] = function(){
	

}

renderer.draw['clear_frame'] = function(){
	ctx.fillStyle = "rgb(0,0,0)";
	ctx.fillRect(0,0, canvas.width, canvas.height);
}

renderer.hasLoaded = function(){
	
	//scroll through all images
	for(var image in this.refs){
		//check if loaded
		if(this.refs.hasOwnProperty(image)){
			
			if(!this.refs[image].loaded) return false;
		}
	
	}
	
	return true;
}

var Style = function(color, options){

	if(!color) color = "white";
	
	if(options.fontSize) this.fontSize = canvas.width/(40 / options.fontSize);
	else this.fontSize = 1;
	
	this.apply = function(){

		ctx.fillStyle = color;
		ctx.font = this.fontSize + "px Helvetica";
		
	}
	if(options.lineWidth) this.lineWidth = (canvas.width/(40/ options.lineWidth)) + this.fontSize;
	else this.lineWidth = 0;
	
	//if(!renderer.styles[name]) renderer.styles[name] = this;
	
}

var UI = function(style, box, options){
	
	for(var prop in box){
		
		if(typeof box[prop] == "string"){
			
			var windowProp = "";
			if(prop == "x" || prop == "width") windowProp = "innerWidth";
			else if (prop == "y" || prop == "height") windowProp = "innerHeight";

			if(box[prop].charAt(0) == "-"){
				box[prop] = window[windowProp] + parseFloat(box[prop]);	
			}else if(box[prop].charAt(0) == "/"){
				box[prop] = box[prop].slice(1);
				box[prop] = window[windowProp]/parseFloat(box[prop]);
			}else{
				box[prop] = 0;
			}
		}
		
		
	}
		
	this.draw = function(array){
		
		var styleInUse = renderer.styles[style];
		
		styleInUse.apply();
		
		var y = 0;	
		
		if(typeof array == "string" || typeof array == "number" ){
			 ctx.fillText(array, box.x, box.y, box.width);
			 return;
		}
		
		for(var i = 0; i < array.length; i++){

			ctx.fillText(array[i], box.x, box.y + (styleInUse.lineWidth * i), box.width);
			
		}
	}
	//if(!renderer.UI[name]) renderer.UI[name] = this;
}


renderer.draw["game"] = function () {
	
	ctx.fillStyle = "rgb(255,255,255)";
		
	//tiled background
	for(var x = 0; x < ((game.server.size.width/12.1)); x++){
	
		for(var y = 0; y < ((game.server.size.height/10.34)); y++){
			this.drawImage("background", x * 944, y * 807);

		}
	}
	
	//teams and their scores and stuff
	game.forAllTeams(function(team){
		
		//wood piles
		var row = 1;
		var col = 1;
		var x = 0;
		var y = 0;

		for(var i = 1; i < team.score; i+= 150){
			
			col += .5;
			if(row < 2) row += 1;
			else row = 1;
			
			x = -Math.floor(col) * 24;
			
			y = -Math.floor(row) * 26;
			
			this.drawImage("pile", (team.baseX - 53) + x, (team.baseY + 61) + y);
		}
		
		//actual base
		this.drawImage('house' + team.name, team.baseX, team.baseY);
		
		//baseScore
		ctx.fillStyle = "white";
		ctx.font="11px Georgia";
		
		this.fillText(team.score, team.baseX - 3, team.baseY + 65);
		
	}.bind(this));

	//trees
	var treeSpriteFinder = {
		1:{x:0, y:0, width:111, height:131},
		2:{x:114, y:0, width:111, height:131},
		3:{x:0, y:131, width:111, height:131},
		4:{x:115, y:132, width:111, height:131},
	}
	
	//trees
	for(var i = 0; i < game.client.trees.length; i++){
		
		var tree = game.client.trees[i];
		if(!tree.removed) this.drawSprite('pines', tree.x - 9, tree.y - 9, treeSpriteFinder[tree.treeNum]);

	}
	
	//notes
	for(var i =0; i< game.client.notes.length; i++){
		if(!game.client.notes[i].removed) {
			this.drawRect("rgb(0,0,180)", game.client.notes[i].x + 29, game.client.notes[i].y + 29, 20, 20);
		}
	}
	
		
	for(var i = 0; i< game.client.objects.length; i++){
		if(!game.client.objects[i].removed) {
			this.drawRect("rgb(180,100,80)", game.client.objects[i].x, game.client.objects[i].y, game.client.objects[i].width, game.client.objects[i].height);
		}
	}
		
	game.forAllPlayers(function(player){
		
		//shadows
		this.drawImage("playershadow", player.x-1 , player.y+ 21);
	
		//CHARACTER DRAWING
		if(player.dead){
			
			this.drawImage(game.server.teams[player.team].name + "corpse", player.x- 4, player.y);
		
		}else if(player.powers.papaBear){
			
			var papaSpriteFinder= {
				"R":{x:0, y:0, width:63, height:63},
				"D":{x:0, y:66, width:63, height:63},
				"L":{x:66, y:0, width:63, height:63},
				"U":{x:66, y:66, width:63, height:63},
			}
			
			this.drawSprite("bear", player.x,player.y, papaSpriteFinder[player.direction]);
			
		}else{
			
			var playerSpriteFinder = {
				"L":{x:2 + ((player.character-1) * 43), y:2, width:41, height:36},
				"R":{x:2 + ((player.character-1) * 43), y:40, width:41, height:33},
				"D":{x:2 + ((player.character-1) * 43), y:75, width:41, height:35},
				"U":{x:2 + ((player.character-1) * 43), y:113, width:41, height:36},
			}
			
			this.drawSprite(game.server.teams[player.renderteam].name + "team", player.x,player.y, playerSpriteFinder[player.direction]);
	
		}
		
		if(!player.dead && !player.powers.papaBear){
			
			if(player.log.has){

				var backpackSpriteFinder = {
					"R":{x:0, y:0, width:60, height:40, playerDelta:{x: -14, y:-3}},
					"D":{x:0, y:40, width:60, height:43, playerDelta:{x: -20, y:-10}},
					"U":{x:0, y:83, width:60, height:39, playerDelta:{x: -20, y:-5}},
					"L":{x:0, y:126, width:60, height:40, playerDelta:{x: 0, y:-3}},	
				}
				
				this.drawSprite("backpacks", player.x + backpackSpriteFinder[player.direction].playerDelta.x, player.y + backpackSpriteFinder[player.direction].playerDelta.y, backpackSpriteFinder[player.direction]);
			}
		
			if (player.attacking){
				//spear DRAWING		
				
				var spearHelper = {
					"U":{x: 36, y: -22},
					"D":{x:0, y: 20},
					"R":{x:36, y:22},
					"L":{x:-26, y:22},
				}
								
				this.drawRect(player.spear.color, player.x + spearHelper[player.direction].x, player.y + spearHelper[player.direction].y, getWidth(player), getHeight(player));	
			}	
		
		}	
		
	    var weapon = user.client.weapon;
		if(player.weapon.state == "attacking") weapon.renderData.drawBlur(player, weapon.renderData.blur[player.direction]);
	    if(weapon.renderData[player.weapon.state]) this.drawImageRelative(weapon.renderData[player.weapon.state][player.direction], player);
		//chat drawing
		if(player.chatting) this.playerText(player);
		
	}.bind(this));
	
	
	if(this.treeText && !user.log.has) this.UI['action prompt'].draw("Press space to cut wood!");
	else if(this.stealText && !user.log.has) this.UI['action prompt'].draw("Press space to steal wood!");
	else if(this.wallText) this.UI['action prompt'].draw("Press space to chop wall!");
	

	if(user.server.dead) this.UI['game screen'].draw("You will respawn soon");
	else if(this.pickedUp) this.UI['game screen'].draw("You just picked up a " + this.pickedUpItem);
	else if(this.buildReject) this.UI["game screen"].draw("You cannot build there");

	//time limit
	if(game.currentSec > game.timeLimit - 100) ctx.fillStyle = "rgb(255,0,0)";
	else ctx.fillStyle = "rgb(0,0,0)";

	this.UI["timer"].draw((game.timeLimit - game.currentSec) + " seconds remaining");
	
	if(builder.on){
		
		var xy = user.getHoldingCoords(builder.refs[builder.item]);
			 
		this.drawRect("rgb(180,100,80)", xy.x, xy.y, builder.refs[builder.item].width, builder.refs[builder.item].height);
	} 
	
	//show note text
	if(this.showNote) this.UI["big screen"].draw(this.currentNote.lines);

};
