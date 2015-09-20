var powers = {}
powers.index = {};

function Power(name, opts){
	
	if(!opts) opts = {};
	powers.index[name] = this;
	
	this.name = name;
	this.deathLoss = opts.deathLoss || false;
	
	this.actions = {};	
	this.actions.recieve = opts.onRecieve || null;
	this.actions.use = opts.onUse || null;
	this.actions.lose = opts.onLoss || null;
	
	this.exclusive = opts.exclusive || false;
	
}

new Power("spear");
new Power("powerWeapon");
new Power("disguise");
new Power("invisibility");
new Power("telescope");
new Power("spearHand");
new Power("sword");
new Power("papaBear", {exclusive: true});