var walls = [{x:1000, y: 1000}];

var builder = {
	on:false,
	item:null,
};

builder.refs = {}

builder.refs["wall"] = {width: 35, height: 35};

builder.start = function(type){
		
	this.item = type;
	this.on = true;
	user.inPlace = true;
	user.log.has = false;
	user.log.stolen = false;
	socket.emit("drop_log", {name: user.name});		
};

builder.scrap = function(){
		
	this.item = null;
	this.on = false;
	user.inPlace = false;
	renderer.buildReject = false;
	
	
};

builder.request = function(){
		
	this.requestXY = user.getHoldingCoords(this.refs[this.item]);
	
	socket.emit("request_placement", {type: this.item, removed:false, x: this.requestXY.x, y: this.requestXY.y, width: this.refs[this.item].width, height: this.refs[this.item].height });
		
};

builder.place = function(){
	
	renderer.buildReject = false;
	this.on = false;	
	user.inPlace = false;
};

builder.reject = function(){
	
	renderer.buildReject = true;
	
	setTimeout(function(){
		
		renderer.buildReject = false;
		
	}, 1000)
		
};
