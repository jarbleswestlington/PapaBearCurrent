var powers = {}
powers.index = {};

function Power(name, opts){
	
	if(!opts) opts = {};
	powers.index[name] = this;
	
	this.name = name;
	this.loseable = opts.loseable || false;
	this.droppable = opts.droppable || false;
	
	
	this.actions = {};	
	this.actions.recieve = opts.onRecieve || null;
	this.actions.use = opts.onUse || null;
	this.actions.lose = opts.onLoss || null;
	this.actions.collide = opts.onCollide || null;
	
	this.illegal = opts.illegal || null; //(no woodcutting, no notes, no stealing, etc, no collisions)
	
	this.exclusive = opts.exclusive || false;
}

new Power("spear", {group: "weapon", exclusive: true});
new Power("powerWeapon");
new Power("disguise");
new Power("invisibility", {exclusive: true});
new Power("telescope");
new Power("sword", {group: "weapon", exclusive: true});
new Power("papaBear", {exclusive: true});