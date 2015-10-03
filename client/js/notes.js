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

	this.once = options.once || true;
	this.resetOnDeath = options.resetOnDeath || false;
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