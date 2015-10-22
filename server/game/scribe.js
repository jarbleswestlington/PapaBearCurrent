//scribe watch? //like mocha spy?
//
tools = require("./tools");

function Event(data){
	this.time = Date.now();
	
	if(data.tags) this.tags = data.tags;
	else this.tags = [];

	this.roles = {};

	if(loc) this.location = loc;
	else this.loc = null;
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

Event.prototype.hasTag = function(tag){
	if(this.tags.indexOf(tag) > -1) return true;
	else return false;
}

Event.prototype.happenedNear = function(distance, comparison){
	var deltaX = this.location.x - comparison.x;
	var deltaY = this.location.y - comparison.y;

	if( Math.abs(deltaX) + Math.abs(deltaY) < distance) return true;
	else return false;
}

Event.prototype.happenedWithin = function(distance, comparison){
	if(tools.colCheck(this.location, comparison, {x: -distance.x, y: -distance.y} ) ) 
}

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

Event.prototype.write = function(){

	var script = "";
	for(var i = 0; i < this.description.length;i++){
		var desc = this.description[i];
		if(typeof desc == "object"){
			script += getInfo.call(this, desc);
		}else if(typeof desc == "string"){
			script+= desc;
		}

		script += " ";
	}

	script += "\n";

	return script;

}

Event.prototype.addRetrospect = function(){

};

function Retrospect(name, opts){


}

function Actor(name, scribe){
	this.name = name;
	this.details = {};
	this.scribe = scribe;
}

function Scribe(){
	this.events = {};
	this.agents = {};
	this.details = {};
	this.chapters = [];
	this.curChapter = null;
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

Scribe.prototype.chapter = function(name, opts){
	var newChap = new Chapter(name, opts, this);
	this.chapters.push(newChap);
	if(!this.curChapter) this.curChapter = newChap;
	return newChap;
}



Scribe.prototype.write = function(name){
	if(name) return this.events[name].write();

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
			script += chap.write();

		});


	}else{
		for(var name in this.events){
			script += this.events[name].write();
		}
	}
	return script;

}

var scribe = new Scribe();

function Chapter(name, opts, scribe){
	// this.scribe = scribe;
	this.name = name;
	if(opts.end) this.end = opts.end;
	if(opts.start) this.start = opts.start;
	this.scenes = {};
}

Chapter.prototype.scene = function(){

}

Chapter.prototype.write = function(){
	var script = "";
	for(var name in this.events){
		script += this.scene[name].write();
	}
	return script;
}


scribe.chapter("It was all fun and trees", {number: 1})

// var startChap = scribe.chapter("freedome", {number: 2})
// scribe.curChapter = startChap;

scribe.event("got shot!").describe(["gracy got shot by a", {details: {gunName: "pistol"} }]);
scribe.event("got shot!").detail({gunName: {pistol: "crazy boy"}});

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

Retrospect is basically just like "YO, this just happened, now I need to gather information
about this item and relate it to this new event"

events are just data
there is no retrospect, plot points are the only thing in side of chapters

chapter should have a climax = true option

///allow functions passed in to be a conditional 

var papaBear = new Scene([
	{factor: "time", search: "events", script: 
		{
			waskilled: ["After", {killed : "name"}, "'s most recent feud with ", {killer : "name"}, ", "],
			woodChop: ["While", {killed : "name"}, " was chopping away at some wood,"],
		}
	},
	{factor: "distance", search: "details", script: 
		{
			team: ["After", {killed : "name"}, "'s most recent feud with ", {killer : "name"}, ", "],
		}
	},
]);

papaBear.addToChapter("Papa Bear Awakens")


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

*/


