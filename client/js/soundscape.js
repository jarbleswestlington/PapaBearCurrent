var soundscape = {};
soundscape.refs = {};
soundscape.conditionals = [];

soundscape.hasLoaded = function(){
	
	//scroll through all sounds
	for(var sound in this.refs){
		//check if loaded
		if(this.refs.hasOwnProperty(sound)){
			console.log(sound);
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

soundscape.checkToPlay = function(){

	this.conditionals.forEach(function(item, i){
		if(item.cond()){
			item.audio.play();
			item.audio.onended = function(){ 
				delete this.conditionals[i] }.bind(this);
		}
	}.bind(this));
	
};

soundscape.playWhen = function(ref, cond){
	newSound = this.refs[ref].cloneNode(); 
	this.conditionals.push({audio: newSound, cond: cond});
};

soundscape.playFrom = function(ref, coord){
	
	var deltaX = Math.abs(user.server.x - coord.x);
	var deltaY = Math.abs(user.server.y - coord.y);
	
	var distance = deltaX + deltaY;
	if(distance < 400)  distance = 400;
	if(distance > 5000) return;
	distance = distance/400;
	
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

