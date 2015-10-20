var noteIndex = {};

var Note = function(name, lines, options){
	this.id = tools.makeId(20);

	this.name = name;
	if(typeof options.condition == 'number'){
		
		this.condition = function(){
			
			return game.getCurrentSec() >= options.condition;
		};
		
	}else{
			
		this.condition = options.condition;

	}
	
	this.lines = lines;

	if(options.once) this.once = true;
	else if(options.once == false) this.once = false;
	else this.once = true;

	if(options.resetOnDeath) this.resetOnDeath = true;
	else this.resetOnDeath = false;
	
	this.probability = options.prob;
	
	if(options.action){
		this.func = options.action.func;
		this.args = options.action.args;
	} 
	
	if(noteIndex[options.prob]) noteIndex[options.prob].push(this);
	else noteIndex[options.prob] = [this];

	noteIndex[this.id] = this;
	
	if(!noteIndex[name]) noteIndex[name] = this;
}

Note.respond = function(noteIn){

	var redo = true;
	
	do{
		
		var chance = Math.floor(Math.random() * 100);
	
		var probability = 1;
	
		if(chance < 15){
			probability = 1;	
		}else if(chance < 45){
			probability = 2;
		}else if(chance < 50){
			probability = 10;
		}else{
			probability = 3;
		}
	
		var notes = noteIndex[probability];

		//prevent it from getting a probability index with nothing in it
		if(!notes) continue;

		notes = notes.filter(function(note){
			if(note.condition() == true){
				if(note.once){
					if(user.notes.indexOf(note.id) == -1) return true;
				}else return true;
			}
			return false;
		});	
	
		if(notes.length > 0) redo = false;
		
	}while(redo);
		
	var random = Math.floor(Math.random() * notes.length);

	var note = notes[random];

	user.queue = [user.readNote.bind(user, note.id), user.getNote.bind(user, {x:noteIn.gridX, y: noteIn.gridY}, note)];
				
}