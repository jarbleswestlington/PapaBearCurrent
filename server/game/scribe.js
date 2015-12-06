//scribe watch? //like mocha spy?
//
tools = require("./tools");

function Event(data){
	this.time = Date.now();
	this.roles = {};

	if(data.tags) this.tags = data.tags;
	else this.tags = [];

	if(data.loc) this.location = data.loc;
	else this.loc = null;
}

Event.prototype.hasTag = function(tag){
	if(this.tags.indexOf(tag) > -1) return true;
	else return false;
}

Event.prototype.happenedBefore = function(start, threshold){
	if(this.time > start - threshold) return true;
	else return false;
}

Event.prototype.happenedAfter = function(start, threshold){
	if(this.time < start + threshold) return true;
	else return false;
}

Event.prototype.happenedWithin = function(start, threshold){
	if(this.happenedAfter(start, threshold) || this.happenedBefore(start, threshold)) return true;
	else return false;
}

Event.prototype.happenedNear = function(distance, comparison){
	var deltaX = this.location.x - comparison.x;
	var deltaY = this.location.y - comparison.y;

	if( Math.abs(deltaX) + Math.abs(deltaY) < distance) return true;
	else return false;
}

Event.prototype.happenedWithin = function(distance, comparison){
	if(tools.colCheck( this.location, comparison, {x: -distance.x, y: -distance.y} ) ) return true
	else return false;
}




// actor
// 	name
// 	events: array of events regarding that player
// 	next: finds next event in time,
// 	previous: finds previosu event in time
// 	closest: finds closest event in space

function Actor(name){
	this.name = name;
	this.events = [];
}

Actor.prototype.involvedIn = function(event, role){
	event.roles[role] = this.name;
	this.events.push(event);
}

// Actor.prototype.set = function(time){
// 	this.
// }



// Event.prototype.describe = function(data){
// 	if(data.constructor == Array){
// 		this.description = this.description.concat(data);
// 	}else{
// 		this.description.push(data);
// 	}
// }

// Event.prototype.detail = function(data){
// 	if(typeof data == "object"){
// 		for(var prop in data){
// 			this.details[prop] = data[prop];
// 		}
// 	} 
	
// 	if(typeof data == "string") return this.details[name];
// }

// function getInfo(object){

// 	for(var typeOfData in object){
// 		// console.log("begin loop", typeOfData);

// 		if(this[typeOfData]){
// 			var keyToGet = object[typeOfData];

// 			if(typeof keyToGet == "object") {
// 				// console.log("recursing!!")
// 				return goalItem = getInfo.call(this[typeOfData], keyToGet);
// 			}else return this[typeOfData][keyToGet];
// 			// console.log("goal", this[typeOfData][keyToGet]);
// 			// console.log("TypeOfData", typeOfData);
// 			// console.log("KEYToGet", keyToGet);
// 			// console.log("goal!", goalItem);
// 		}


// 		//for scribe details
// 		// if(!goalItem && this.scribe[typeOfData]){
// 		// 	var keyToGet = object[typeOfData];

// 		// 	console.log("KEY2", this);

// 		// 	if(typeof keyToGet == "object") {

// 		// 		goalItem = getInfo.call(this, keyToGet);
// 		// 	}

// 		// 	var goalItem = this.scribe[typeOfData][keyToGet]
// 		// }

	

// 		if(goalItem) return goalItem;
// 		else return "DETAIL NOT FOUND";
// 	}	
	
// }

// Event.prototype.write = function(){

// 	var script = "";
// 	for(var i = 0; i < this.description.length;i++){
// 		var desc = this.description[i];
// 		if(typeof desc == "object"){
// 			script += getInfo.call(this, desc);
// 		}else if(typeof desc == "string"){
// 			script+= desc;
// 		}

// 		script += " ";
// 	}

// 	script += "\n";

// 	return script;

// }

// Event.prototype.addRetrospect = function(){

// };

// function Retrospect(name, opts){


// }

function Actor(name, scribe){
	this.name = name;
	this.details = {};
	this.scribe = scribe;
}

function Scribe(){
	this.events = {};
	this.actors = {};
	this.chapters = [];
	this.curChapter = 0;
}

Scribe.prototype.event = function(name){
	if(this.events[name]) return this.events[name];
	else this.events[name] = new Event(name, this);
	// if(this.chapters.length && this.curChapter) this.curChapter.events[name] = this.events[name];

	return this.events[name];
}

Scribe.prototype.actor = function(name){
	if(this.actors[name]) return this.actors[name];
	else this.actors[name] = new Actor(name, this);

	return this.actors[name];
}

Scribe.prototype.chapter = function(name, func, opts){
	var newChap = new Chapter(name, func, opts, this);
	this.chapters.push(newChap);
	if(!this.curChapter) this.curChapter = newChap;
	return newChap;
}


Scribe.prototype.findChapter = function(name){

	var found = null;

	this.chapters.forEach(function(chap){
		if(chap.name = name) found = chap;
	})

	return found;
}

Scribe.prototype.write = function(name){
	if(name){
		var chap = this.findChapter(name)
		if(chap) chap.write(this.events, this.actors);
	} 

	var script = '';

	if(this.chapters.length){
		this.chapters.sort(function(a,b){
			if(!a.number) return 1;
			if(!b.number) return -1;
		
			return a.number - b.number;
		});

		this.chapters.forEach(function(chap, i){
			script += "Chapter " + (i + 1) + ": ";
			script += chap.name;
			script += "\n\n";
			script += chap.write(this.events, this.actors);

		}.bind(this));


	}
	return script;

}

var scribe = new Scribe();

function Chapter(name, func, opts){
	if(!opts) opts = {};
	this.name = name;
	this.func = func;
	if(opts.end) this.end = opts.end;
	if(opts.start) this.start = opts.start;
}

Chapter.prototype.write = function(events, actors){
	return this.func(events, actors)
}


scribe.events({tags: ["kill"]})

scribe.chapter("prologue", function(events, actors){
	var script = "";

	console.log(events, actors);

	return script;


})

// var startChap = scribe.chapter("freedome", {number: 2})
// scribe.curChapter = startChap;
console.log(scribe.write());


/* GOAL
It was a peaceful time in the woods. Winter was coming and every village
knew that they must gather wood in order to survive the harsh winter.

____ from the ____ team was wandering through the woods when they stumbled across the _____ teams base. They 


Record all events -- visits, kills, filter by significance
significant relationships
significant events changes in patterns Events that triggered patterns

After papa bear event, That player and his previous movements suddenly becomes so much more important
Meanwhile...in the woods. So and so stumbled about a mysterious box that turned him into a bear

How to gather all that users previous events, threshold of inclusion for retrospect

climax = true -- changes dynamics



///real one

function(actors, events)


actors.tagged("red");

events.within("100");

jon.eventCount("george", ["killed"]);



will go through all chapters function and run them in order that the chapters got added

Each function needs the actors, settings, and events
Each function will do its calculations and spit back its contents

player = {x: 200, y: 200};

events.find( { time: 300, after/before/from : this.time } )
//should return all events within 300 seconds of this.time

events.find( { distance: {x: 100, y:100}, from: player })
//should return all events within 100x, 100y of the player

events.find( { role: "killer", as: player.actor });

events.find( { tag: ["papaBear"] } )

search by tag, distance, deltaTime, and roles

events need a time, location, and tags, and perhaps actors
actors have events inside of them


var killEvent = Scribe.createEvent(location: box, tags: ["kill"]});
//creates timestamp
//saves location, and tags

player.actor.addEvent(killEvent, "killer")
//saves position of actor
//adds pointer to this event in actor
//adds role to roles object in event pointing to actor

scribe.write


Scribe
	events //has all events
	findEvents
	actors
	findActors
	write

chapters
	write: a function that accepts actors and events and returns script
	time: time defined
	number: ordering criterion that overwrites time

event
	roles
	time
	location
	tags
	hasTag

actor
	name
	events: array of events regarding that player
	next: finds next event in time,
	previous: finds previosu event in time
	closest: finds closest event in space

*/



