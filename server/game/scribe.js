function Event(name, dir){
	this.name = name;
	this.timeStamp = Date.now();
	this.details = {};
	this.description = [];
	this.scribe = dir;

}

Event.prototype.describe = function(data){
	if(data.constructor == Array){
		this.description.concat(data);
	}else{
		this.description.push(data);
	}
}

Event.prototype.detail = function(name){

}

Event.prototype.write = function(){

	var print = "";
	for(var i = 0; i < this.description.length;i++){
		var desc = this.description[i];
		if(typeof desc == "object"){
			for(var typeOfData in desc){
				if(goalItem){
					print+= goalItem;
				}else{
					
				}
				var keyToGet = desc[typeOfData];
				var goalItem = this.scribe[typeOfData][keyToGet]

			}
		}else if(typeof desc == "string"){
			print+= desc;
		}
	}

	print += "\n";

	return print;

}

Event.prototype.addRetrospect = function(){

};

function Retrospect(name, opts){


}

function Agent(name, dir){
	this.name = name;
	this.details = {};
	this.scribe = dir;
}

function Scribe(){
	this.events = {};
	this.agents = {};
	this.details = {};
}

Scribe.prototype.event = function(name){
	if(this.events[name]) return this.events[name];
	else this.events[name] = new Event(name, this);
	return this.events[name];
}

Scribe.prototype.agent = function(name){
	if(this.agents[name]) return this.agents[name];
	else this.agents[name] = new Agent(name, this);
	return this.agents[name];
}

Scribe.prototype.write = function(name){
	if(name) return this.events[name].write();

}

var scribe = new Scribe();

scribe.event("got shot!").describe("gracy got shot 5 times.");

console.log(scribe.write("got shot!"));



