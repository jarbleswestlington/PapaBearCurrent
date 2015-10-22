var tools = require('./tools.js');

var powers = require('./tools.js');

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function Tree(x, y, opts){
	this.tag = "tree";
	this.x = x * 78;
	this.y = y * 78;
	this.removed = false;
	this.width =78;
	this.height = 78;
	this.treeNum = getRandomInt(1,4);
	this.gridX = x;
	this.gridY = y;
	this.priority = 1;
	this.hard = true;

	this.draw = function(){
		if(this.removed) return;
		renderer.drawSprite("pines", this.x - 9, this.y - 9, renderer.spriteData["tree"][this.treeNum]);
	}
}

Tree.prototype.collide = function(agent){
	if(this.removed) return;
	if(tools.colCheck(agent, this)) return true;
}


function Note(x, y, opts){
	this.tag = "note";
	this.x = (x * 78) + 10;
	this.y = (y * 78) + 10;
	this.gridX = x;
	this.gridY = y;
	this.removed = false;
	this.width =60;
	this.height = 42;

	this.hard = false;
	this.priority = 3;

	this.draw = function(){
		if(this.removed) return;
		renderer.drawImage("chest", this.x, this.y);
	}

}

function Obj(data){

	this.tag = "obj";
	this.priority = 4;
	this.removed = false;
	this.ref = "rgb(180,0,0)";

	for(var prop in data){
		this[prop] = data[prop];
	}

	this.draw = function(){
		if(this.removed) return;
		
		if(this.type == "wall"){
			renderer.drawImage("hedgehog", this.x - 2, this.y - 10);           
        }else if(this.type == "drop"){
            if(this.power == "sword"){
           		renderer.drawImage("swordDia", this.x, this.y, this.width, this.height);
           	}else if(this.power == "spear"){
           		renderer.drawImage("spearDia", this.x, this.y, this.width, this.height);
           	}else if(this.power == "powerWeapon"){
           		renderer.drawImage("spearPDia", this.x, this.y, this.width, this.height);
           	}else if(this.img){
           		renderer.drawImage(this.img, this.x, this.y, this.width, this.height);
           	}else{
           		renderer.drawRect("rgb(180,100,80)", this.x, this.y, this.width, this.height);
           	}
       	}else if(this.type == "boulder"){
           		renderer.drawImage("bearStatue", this.x, this.y);
           	}else{
			renderer.drawRect("rgb(180,100,80)", this.x, this.y, this.width, this.height);
		}
	}

}

Obj.prototype.collide = function(agent){
	if(!this.hard || this.removed) return;
	return tools.colCheck(agent, this);
};

module.exports = {
	Tree: Tree,
	Note: Note,
	Obj: Obj,
}
