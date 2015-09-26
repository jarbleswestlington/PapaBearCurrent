//get animation function (used in gameStateManager)
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
	
	toReset: [],

	UI:{},
};

renderer.spriteData = {
	"tree" : {
		1:{x:0, y:0, width:111, height:131},
		2:{x:114, y:0, width:111, height:131},
		3:{x:0, y:131, width:111, height:131},
		4:{x:115, y:132, width:111, height:131},
	},
}

renderer.upload = function(src){
	var newImg = new Image();
	newImg.src = "/images/" + src + ".png";
	this.refs[src] = newImg;
	this.refs[src].onload = function(){
		
		this.loaded = true;
		
	}.bind(this.refs[src]);
}

renderer.updateCamera = function(){
	
	this.camera.y = canvas.height/2 - (user.server.y + user.server.height/2);
	this.camera.x = canvas.width/2 - (user.server.x + user.server.width/2);
};

renderer.drawUI = function(image, coordX, coordY, stretchX, stretchY){
	
	if(!this.refs[image]){
		ctx.fillStyle = image;
		
		ctx.fillRect(coordX, coordY, stretchX, stretchY);
	} 
	else if(stretchX && stretchY){
		ctx.drawImage(this.refs[image], coordX, coordY, stretchX, stretchY);
		return;
	}
	
}

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
	
	ctx.drawImage(this.refs[image], sprite.x, sprite.y, sprite.width, sprite.height, coordX + this.camera.x, coordY + this.camera.y, sprite.width, sprite.height);

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

renderer.reset = function(){
	this.toReset.forEach(function(item){
		item.render = false;
	});
}

var Style = function(color, options){

	if(!color) color = "white";
	
	if(options.fontSize) this.fontSize = canvas.width/(40 / options.fontSize);
	else this.fontSize = 1;
	
	this.apply = function(){

		ctx.fillStyle = color;
		ctx.font = this.fontSize + "px Helvetica";
		
	}
	if(options.lineWidth) this.lineWidth = (canvas.width/( 40/ options.lineWidth) ) + this.fontSize;
	else this.lineWidth = this.fontSize;
	
	if(options.gridWidth) this.gridWidth = (canvas.width/( 40/ options.gridWidth) ) + this.fontSize;
	else this.gridWidth = this.fontSize;
	
	this.padding = {};
	if(options.paddingX) this.padding.x = canvas.width/( 40 / options.paddingX );
	else this.padding.x = 0;
	
	if(options.paddingY) this.padding.y = canvas.width/( 40 / options.paddingY );
	else this.padding.y = 0;
		
	//if(!renderer.styles[name]) renderer.styles[name] = this;
	
}

var UI = function(name, box, options){
	
	for(var prop in box){
		
		if(typeof box[prop] == "string" && prop !== "style"){
			
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
	
	this.box = box;

	if(options){
		if(options.item) this.item = options.item;
		else this.item = null;
		if(options.background) this.background = options.background;
		else this.background = null;
		if(options.startRender) this.render = options.startRender;
		else this.render = true;
		if(options.condition) this.condition = options.condition;
		else this.condition = null;
		if(options.reset !== false) renderer.toReset.push(this);	
		if(options.type) this.type = options.type;
		else this.type = "block";
		if(options.cols) this.cols = options.cols;
		else this.cols = 10;
		if(options.rows) this.rows = options.rows;
		else this.rows = 10;
		if(options.ref) this.ref = options.ref;
		else this.ref = [];

	}else{
		this.render = true;
		this.condition = null;
		this.background = null;
		renderer.toReset.push(this);
		this.mode = "player";	
		this.type = "block";
	}
	
	this.check = function(){
		if(this.condition && !this.condition()) return false;
		if(!this.render) return false;
		return true;
	}
		
	this.draw = function(itemIn){
		if(!this.check()) return;
		if(!itemIn && !this.item) return;
		if(!itemIn) itemIn = this.item;

		if(typeof itemIn == "function") itemIn = itemIn();
		if(typeof itemIn == "string" || typeof itemIn == "number" ) itemIn = [itemIn];
		if(this.background) this.bg();

		
		var style = renderer.styles[this.box.style];
		style.apply();

		this[this.type](itemIn, style);
	}

	this.block = function(item, style){
		var y = 0;

		for(var i = 0; i < item.length; i++){
						
			paddingY = 0;
			if(i == 0) paddingY = style.padding.y;
			//else if(i == item.length -1) paddingY = -style.padding.y;
			
			if(renderer.refs[item[i]]) renderer.drawUI(item[i], box.x + style.padding.x, box.y + paddingY + (style.lineWidth * (i + 1)), box.width - style.padding.x, style.lineWidth);
			else ctx.fillText(item[i], box.x + style.padding.x, box.y + paddingY + (style.lineWidth * (i + 1)), box.width - (style.padding.x * 2) );
			
		}
	}
	
	this.bg = function(){
		if(renderer.refs[this.background]) renderer.drawUI(this.background, box.x, box.y, box.width, box.height);
		
	}
	
	this.grid = function(item, style){
		if(!this.check()) return;
		if(this.background) this.drawBackground(); 
	
		var y = 0;	
		var x = 0;
		
		for(var i = 0; i < this.ref.length; i++){
			
			if(i != 0){
				if(i%this.cols == 0) x = 0, y++;
				else x++;
			}	
			var drawX = box.x + (x * ( style.gridWidth + ( style.padding.x * 2 )) );
			var drawY = box.y + (y * ( style.lineWidth + ( style.padding.y * 2 )) );
			var cell = {x: drawX, y: drawY, width: style.gridWidth, height: style.lineWidth}
			
			renderer.drawUI(item, drawX, drawY, cell.width, cell.height);
					
			//noteCode	
			if(inputManager.mouse.down){
				if(tools.colCheck(inputManager.mouse.collider, cell)){
					user.readNote(this.ref[i]);
				}
			}
			
		}
	}
	if(!renderer.UI[name]) renderer.UI[name] = this;
}

renderer.drawAll = function(arr){
	ctx.fillStyle = "rgb(255,255,255)";
	for(var i = 0; i < arr.length; i++){
		if(!arr[i]) continue;
		if(arr[i].constructor == Array) renderer.drawAll(arr[i]);
		else if(typeof arr[i] == "function") arr[i](function(item){ item.draw() });
		else arr[i].draw();
	}
}
