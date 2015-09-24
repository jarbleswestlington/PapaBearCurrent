var soundscape = {};
soundscape.refs = {};
soundscape.conditionals = [];

soundscape.hasLoaded = function(){
	
	//scroll through all sounds
	for(var sound in this.refs){
		//check if loaded
		if(this.refs.hasOwnProperty(sound)){
			if(!this.refs[sound].loaded) return false;
		}
	
	}
	
	return true;
}

soundscape.upload = function(src){
	var newSound = new Audio();
	newSound.src = "/audio/" + src + ".mp3";
	
	this.refs[src] = newSound;
	this.refs[src].oncanplaythrough = function(){
		this.loaded = true;
		
	}.bind(this.refs[src]);

};

soundscape.check = function(){

	this.conditionals.forEach(function(item, i){
		if(item.cond()){
			item.audio.play();
			item.audio.onended = function(){ 
				this.conditionals.splice(i); 
			}.bind(this);
		}
	}.bind(this));
	
};

soundscape.broadcast = function(ref, level){
	
	socket.emit("play_everywhere", {name: ref, coords: {x: user.server.x, y: user.server.y}, level: level });
	
};

soundscape.playWhen = function(ref, cond){
	newSound = this.refs[ref].cloneNode(); 
	this.conditionals.push({audio: newSound, cond: cond});
};

soundscape.playFrom = function(ref, coord, level){
	//1 like on top of
	//2 next to
	//3-5 immediate vicinity
	//6-10 a stones throw//playing catch
	//11-25 11: base boundary  25: 10 grids over (about the deltaX of bases)
	//40 - will breach the boundaries of a team territory that is 10 up and 10 to the left
	//50 -- will reach the boundaris of that teams BASE, not the territory
	//60 -- will cover that neighboring teams whole territory
	//121 -- will make it corner to corner in a 60x60 map -- but very soft in corner
	
	if(user.mode == "master"){
		var deltaX = Math.abs(renderer.camera.x - coord.x);
		var deltaY = Math.abs(renderer.camera.y - coord.y);
	}else{
		var deltaX = Math.abs(user.server.x - coord.x);
		var deltaY = Math.abs(user.server.y - coord.y);
	}

	
	var distance = deltaX + deltaY;
	if(distance < 5 * level)  distance = 5 * level;
	if(distance > 75 * level) return;
	distance = distance/(5 * level);
	
	newSound = this.refs[ref].cloneNode(); 
	newSound.volume = 1/distance;
	newSound.play();
	newSound.onended = function(){ delete newSound };

};

soundscape.play = function(ref){
	
	this.refs[ref].play();
}

soundscape.playOnce = function(ref){
	
	var played = false;

	return function(){
		if(!played) {
			this.refs[ref].play();
			played = true;
		}
	}
}


// Sound.prototype = Object.create(Audio.prototype);
// Sound.prototype.constructor = Sound;

