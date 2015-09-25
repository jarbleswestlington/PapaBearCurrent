function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function Tree(x, y, opts){
	this.x = x * 78;
	this.y = y * 78;
	this.removed = false;
	this.width =78;
	this.height = 78;
	this.treeNum = getRandomInt(1,4);

	this.ref = "pines";
	this.hard = true;

	this.draw = function(){
		if(this.removed) return;
		renderer.drawSprite(this.ref, this.x - 9, this.y - 9, renderer.spriteData["tree"][this.treeNum]);
	}
}


function Note(x, y, opts){
	this.x = x * 78;
	this.y = y * 78;
	this.removed = false;
	this.width =78;
	this.height = 78;

	this.ref = "rgb(0,0,180)";
	this.hard = true;

	this.draw = function(){
		if(this.removed) return;
		renderer.drawRect(this.ref, this.x + 29, this.y + 29, 20, 20);
	}

}

function Obj(data){
	for(var prop in data){
		this[prop] = data[prop];
	}

	this.removed = false;
	this.ref = "rgb(180,0,0)";

	this.draw = function(){
		if(this.removed) return;
		renderer.drawRect("rgb(180,100,80)", this.x, this.y, this.width, this.height);
	}

}

module.exports = {
	Tree: Tree,
	Note: Note,
	Obj: Obj,
}
