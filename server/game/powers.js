var powers = {}
powers.index = {};

function Power(name, opts){
	
	if(!opts) opts = {};
	powers.index[name] = this;
	
	this.name = name;
	this.loseable = opts.loseable || false;
	this.droppable = opts.droppable || false;
	
	this.actions = {};	
	this.onRecieve = opts.onRecieve || null;
	this.onUse = opts.onUse || null;
	this.onLose = opts.onLoss || null;
	this.onCollide = opts.onCollide || null; //if collded with player that used
	
	this.handicap = opts.handicap || null; //(no woodcutting, no notes, no stealing, etc, no collisions)
	
	this.include = opts.include || null;
	this.exclusive = opts.exclusive || false;
}

new Power("spear", {
	group: "weapon",
	exclusive: true,
	onRecieve: function(player){
		player.spear.color = "grey";
	},
 }
);
new Power("powerWeapon", {
	onRecieve: function(player){
		player.spear.color = "yellow";
	},
	include: ["spear"],
});
new Power("disguise");
new Power("invisibility", {exclusive: true});
new Power("telescope");
new Power("sword", {group: "weapon", exclusive: true});
new Power("papaBear", {
	exclusive: true,
	onRecieve: function(player){
		player.x -= player.x%78;
		player.x+=6;
		player.y -= player.y%78;
		player.y+=6;
		player.width = 63;
		player.height = 63;
	},
	onLose: function(player){
		player.width = 41;
		player.height = 36;		
	}
});

Power.prototype.lose = function(player){
	player.powers[this.name] = false;
	
	if(this.onLose) this.onLose(player);
	if(this.includes){
		this.includes.forEach(function(power){
			player.powers[power] = false;
		});
	}
	if(this.loseable){
		player.powers[this.name] = false;
	}
	if(this.droppable){
		var obj = {power: this.name, type: "power", hard: false, removed:false, x: player.x, y: player.y, width: 20, height: 20 };
		game.objects.push(obj);
		io.sockets.emit("add_object", obj);
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

module.exports = powers;