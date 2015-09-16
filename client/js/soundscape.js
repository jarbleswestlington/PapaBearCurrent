var soundscape = {};
soundscape.refs = {};

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
	this.refs[src].addEventListener('canplaythrough', function(){
		this.loaded = true;
		
	}.bind(this.refs[src]));

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

