var noteIndex = {};

var Note = function(lines, options){
	
	if(typeof options.condition == 'number'){
		
		this.condition = function(){
			
			return game.getCurrentSec() >= options.condition;
		};
		
	}else{
			
		this.condition = options.condition;

	}
	
	this.lines = lines;

	this.probability = options.prob;
	
	if(options.action){
		this.func = options.action.func;
		this.args = options.action.args;
	} 
	
	if(noteIndex[options.prob]) noteIndex[options.prob].push(this);
	else noteIndex[options.prob] = [this];
	
}