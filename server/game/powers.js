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
	this.onCollide = opts.onCollide || null;
	
	this.illegal = opts.illegal || null; //(no woodcutting, no notes, no stealing, etc, no collisions)
	
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
	}
});

module.exports = powers;