var Obj = require('./objects.js').Obj;
var game = require('./game.js');

var powers = {}
powers.index = {};

function Power(name, opts){
	
	if(!opts) opts = {};
	powers.index[name] = this;
	
	this.name = name;
	this.loseable = opts.loseable || true;
	this.droppable = opts.droppable || false;
	
	this.actions = {};	
	this.onRecieve = opts.onRecieve || null;
	this.onUse = opts.onUse || null;
	this.onLose = opts.onLose || null;
	this.onCollide = opts.onCollide || null; //if collded with player that used

	this.handicap = opts.handicap || null; //(no woodcutting, no notes, no stealing, etc, no collisions)
	this.default = opts.default || false;

	this.include = opts.include || null;
	this.exclusive = opts.exclusive || false;
	this.group = opts.group || false;

}

Power.prototype.lose = function(player){
	var sockets = require("./sockets.js").access;

	console.log(player.name + " lost the power:" + this.name);

	if(this.onLose) {
		this.onLose(player);
	}
	if(this.include){
		this.include.forEach(function(power){
			player.powers[power] = false;
		});
	}
	if(this.loseable){
		player.powers[this.name] = false;
	}
	if(this.droppable){
		console.log(this.name + " was dropped by: " + player.name);
		var obj = {power: this.name, type: "power", hard: false, removed:false, x: player.x, y: player.y, width: 20, height: 20 };
		var newObj = new Obj(obj)
		game.objects.push(newObj);
		
		sockets.emit("add_object", newObj);
	}
	
};

Power.prototype.giveTo = function(player){

	if(this.exclusive){
		if(this.group){
			for(var powerPlayer in player.powers){
				if(powers.index[powerPlayer].group == this.group) powers.index[powerPlayer].lose(player);	 
			}
		}else {
			player.loseAllPowers();
		}
	}
	player.powers[this.name] = true;
	if(this.include && this.include.length){
		this.include.forEach(function(power){
			var morePower = powers.index[power];	
			morePower.giveTo(player);
		});
	}
	
	if(this.onRecieve) this.onRecieve(player);
	console.log(this.name + " given to Player:" + player.name);
	
}

module.exports = {
	Power: Power,
	powers: powers,
};