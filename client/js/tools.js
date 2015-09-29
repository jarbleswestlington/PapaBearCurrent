var tools = {};
console.log(tools);

function findInArray(arr, addTo){
	for(var i = 0; i < arr.length; i++){
		var current = arr[i];
		if(current.updated && current.updated.length){
			addTo[i] = {};
			findAndAdd(current, addTo);
		}
	}
}
function findInObject(obj, addTo){
	for(var prop in obj){
		var current = obj[prop];
		if(current.updated && current.updated.length){
			addTo[prop] = {};
			findAndAdd(current, addTo[prop]);
		}
	}
}

tools.checkAll = function(agent, obstacles){
	if(agent.constructor != Array) agent = [agent];
	if(obstacles.constructor != Array) obstacles = [obstacles];

	for(var a = 0; a < agent.length; a++){
		for(var o = 0; o < obstacles.length; o++){
			if(obstacles[o].constructor == Array){
				if(!this.checkAll(agent[a], obstacles[o])) return false;
			}else if(typeof obstacles[o] == "function"){
				if(obstacles[o](function(item){ if( item.collide(agent[a]) ) return true; })) return false;
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

var debug = false;

if(debug == true){

//Original func
var x = socket.$emit;

socket.$emit = function(){
     var event = arguments[0];
     var feed  = arguments[1];

     //Log
     console.log(event + ":" + feed);

    //To pass listener  
    x.apply(this, Array.prototype.slice.call(arguments));       
};

}
