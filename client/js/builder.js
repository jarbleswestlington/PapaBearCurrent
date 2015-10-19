
var builder = {
	on:false,
	item:null,
	rejected: false,
};

builder.refs = {}

builder.refs["wall"] = {width: 35, height: 35};

builder.start = function(type){	
	this.item = type;
	this.on = true;
	user.inPlace = true;
	user.log.has = false;
	user.log.stolen = false;
};

builder.scrap = function(){
	this.item = null;
	this.on = false;
	user.inPlace = false;
	this.rejected = false;
};

builder.request = function(){
		
	this.requestXY = user.getHoldingCoords(this.refs[this.item]);
	socket.emit("request_placement", {hp: 33, type: this.item, tag: this.item, hard: true, removed:false, x: this.requestXY.x, y: this.requestXY.y, width: this.refs[this.item].width, height: this.refs[this.item].height });
		
};

builder.place = function(){
	
	this.rejected = false;
	this.on = false;	
	user.inPlace = false;
	socket.emit("drop_log", {name: user.name});

};

builder.reject = function(){
	
	this.rejected = true;
	this.on = false;	
	user.inPlace = false;
	setTimeout(function(){
		
		this.rejected = false;
		
	}.bind(this), 1000);
		
};

builder.draw = function(){
	if(!builder.on) return;
	
	var xy = user.getHoldingCoords(builder.refs[builder.item]);
	renderer.drawImage("hedgehog", xy.x, xy.y);
}
