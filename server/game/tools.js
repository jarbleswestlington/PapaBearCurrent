var tools = {};

tools.debounce = function(func, wait, runImmediately) {
	var timeout;
	return function() {
		var context = this, args = arguments;

		if(timeout) return;
		var later = function() {
			timeout = null;
			func.apply(context, args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

tools.bounce = function(func, wait, runImmediately) {
	var timeout;
	var run = runImmediately;
	return function() {
		var context = this, args = arguments;

		var restart = function() {
			run = true;
		};

		if(run){
			func.apply(context, args);
			run = false;
			timout = setTimeout(restart, wait);
		}

		// if(timeout) return;
	

		// clearTimeout(timeout);
		// timeout = setTimeout(later, wait);
	};
};


tools.buildUpdated = function(root){
	var result = {};

	function findInArray(arr, addTo){
		var found = false;
		for(var i = 0; i < arr.length; i++){
			var current = arr[i];
			for(var prop in current.updated){
				addTo[i] = {};
				found = true;
				findAndAdd(current, addTo);
			}
		}
		return found;
	}
	function findInObject(obj, addTo){
		var found = false;
		for(var prop1 in obj){
			var current = obj[prop1];
			for(var prop2 in current.updated){
				found = true;
				addTo[prop1] = {};
				findAndAdd(current, addTo[prop1]);
			}
		}
		return found;
	}

	function findAndAdd(node, addTo){
		for(var prop in node.updated){
			delete node.updated[prop];
			if(node[prop].constructor == Array){
				addTo[prop] = [];
				if(findInArray(node[prop], addTo[prop])){
				}else addTo[prop] = node[prop]; 
			}else if(node[prop].constructor == Object){
				addTo[prop] = {};
				if(findInObject(node[prop], addTo[prop])){
				}else addTo[prop] = node[prop]; 
			}else{
				addTo[prop] = node[prop]; 
			} 
		}
	}
	findAndAdd(root, result);

	return result;
}

tools.getFunctionName = function(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

if (!String.prototype.includes) {
  String.prototype.includes = function() {'use strict';
    return String.prototype.indexOf.apply(this, arguments) !== -1;
  };
}


tools.checkAll = function(agent, obstacles){
	if(agent.constructor != Array) agent = [agent];
	if(obstacles.constructor != Array) obstacles = [obstacles];

	for(var a = 0; a < agent.length; a++){

		var funcArg = function(item){
			if( item.collide(agent[a]) ) return true;
		};

		for(var o = 0; o < obstacles.length; o++){
			if(obstacles[o].constructor == Array){
				if(!this.checkAll(agent[a], obstacles[o])) return false;
			}else if(typeof obstacles[o] == "function"){

				// if( obstacles[o].tag = "Relevant" || tools.getFunctionName(obstacles[o]).includes("Relevant") ){
				// 	console.log("relevant");
				// 	if( obstacles[o](funcArg, {x: agent[a].x, y: agent[a].y}) ) return false;

				// }else{

				if( obstacles[o](funcArg, {x: agent[a].x, y: agent[a].y}) ) return false;
				
			}else{
				if(obstacles[o].collide(agent[a])) return false;
			}
		}
	}
	
	return true;

};

tools.colCheck = function(smaller, bigger, padding){
	if((smaller.width - bigger.width) + (smaller.height - bigger.height) > 0){
		var oldSmall = smaller;
		smaller = bigger;
		bigger = oldSmall;
	}
	// if(smaller.width > bigger.width || smaller.height > bigger.height){

	// }
	
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
		
	if( (smaller.x >= bigger.x + padding.x && smaller.x <= bigger.x + bigger.width - padding.x) || (smaller.x + smaller.width >= bigger.x + padding.x && smaller.x + smaller.width <= bigger.x + bigger.width - padding.x) ){

       if( (smaller.y >= bigger.y + padding.y && smaller.y <= bigger.y + bigger.height - padding.y) || (smaller.y + smaller.height >= bigger.y + padding.y && smaller.y + smaller.height <= bigger.y + bigger.height - padding.y) ){

           return true;
       }

   }
	
}

tools.colCheckRelative = function(smallerGroup, biggerGroup, padding){
	if(!padding) padding = {x:0, y: 0, width:0, height: 0};
	
	if(biggerGroup.item) biggerGroup = {x: biggerGroup.item.x + biggerGroup.influencer.x, y: biggerGroup.item.y + biggerGroup.influencer.y, width: biggerGroup.item.width, height: biggerGroup.item.height};

	if(smallerGroup.item) smallerGroup = {x: smallerGroup.item.x + smallerGroup.influencer.x, y: smallerGroup.item.y + smallerGroup.influencer.y, width: smallerGroup.item.width, height: smallerGroup.item.height};

	return this.colCheck(smallerGroup, biggerGroup, padding);
}

tools.checkCollision = function(item, shark, itemWidth, itemHeight, sharkWidth, sharkHeight, paddingX, paddingY){

   if( (item.x >= shark.x + paddingX && item.x <= shark.x + sharkWidth - paddingX) || (item.x + itemWidth >= shark.x + paddingX && item.x + itemWidth <= shark.x + sharkWidth - paddingX) ){

       if( (item.y >= shark.y + paddingY && item.y <= shark.y + sharkHeight - paddingY) || (item.y + itemHeight >= shark.y + paddingY && item.y + itemHeight <= shark.y + sharkHeight - paddingY) ){

           return true;

       }
 
   }
}

tools.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

tools.getRandomArbitrary = function( numone,  numtwo) {
	return Math.floor(Math.random() * (numtwo - numone) + 1);
}

tools.makeId = function(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

module.exports = tools;