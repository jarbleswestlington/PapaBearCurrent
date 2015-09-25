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

	this.ref = "tree";
	this.hard = true;

	draw = function(){
		if(this.removed) return;
		renderer.drawSprite(this.ref, this.x - 9, this.y - 9, renderer.spriteData["tree"][treeNum]);
	}

}

module.exports = {
	Tree: Tree,
}
