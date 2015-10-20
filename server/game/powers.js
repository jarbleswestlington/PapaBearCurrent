var Obj = require('./objects.js').Obj;

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

	this.dropImg = opts.dropImg || null;

	this.key = opts.key || null;

	this.handicap = opts.handicap || null; //(no woodcutting, no notes, no stealing, etc, no collisions)
	this.default = opts.default || false;

	this.include = opts.include || null;
	this.exclusive = opts.exclusive || false;

	this.group = opts.group || false;

}

Power.prototype.lose = function(player, fromIncludes){
	var sockets = require("./sockets.js").access;
	var game = require('./game.js');

	console.log(player.name + " lost the power:" + this.name);

	if(this.onLose) {
		this.onLose(player);
	}
	if(this.include){
		this.include.forEach(function(power){
			powers.index[power].lose(player, true);
		});
	}
	if(this.loseable){
		player.powers[this.name] = false;
		player.addUpdate("powers");
	}
	if(this.droppable && !fromIncludes){
		console.log(this.name + " was dropped by: " + player.name);
		var obj = {power: this.name, type: "drop", img: this.dropImg, tag: this.name, hard: false, removed:false, x: player.x, y: player.y, width: 45, height: 45 };
		var newObj = new Obj(obj)
		game.objects.push(newObj);
		sockets.emit("add_object", newObj);
	}
	
};

Power.prototype.giveTo = function(player, fromIncludes){

	if(this.exclusive && !fromIncludes){
		if(this.group){
			for(var name in player.powers){
				if(player.powers[name] && powers.index[name].group == this.group){
		

					powers.index[name].lose(player, player.powers[name].included);
				} 	 
			}
		}else {
			player.loseAllPowers();
		}
	}
	if(this.include && this.include.length){
		this.include.forEach(function(power){
			var morePower = powers.index[power];	
			morePower.giveTo(player, true);
		});
	}
	
	player.powers[this.name] = {has: true, included: fromIncludes};
	player.addUpdate("powers");
	if(this.onRecieve) this.onRecieve(player);
	console.log(this.name + " given to Player:" + player.name);
	
}

module.exports = {
	Power: Power,
	powers: powers,
};