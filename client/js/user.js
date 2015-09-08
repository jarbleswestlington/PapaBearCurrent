var URI = window.location.pathname.split( '/' );
//setUp users user
var user = {
	
	name: URI[URI.length-1],
	amount:0,
	dashing:false,
	dashStart:0,
	log:{
		has: false,
		stolen: false,
		stolenFrom: "",
		wood: 0,
	},	
	
	server:{
		x:0,
		y:0,
		
		attacking:false,

		hasPapa:false,
		hasSword:false,
		
		dead:false,
		weapon:{
			has:false,
			power:false,
		},
		log:{
			has: false,
			stolen: false,
			stolenFrom: "",
			wood: 0,
		},
		powers:{}
	}

	
};



user.interactWBase = function(){
	
	renderer.stealText = false;

	if(!this.server.powers.papaBear){
			
		game.forAllTeams(function(team){
			
			if(game.checkCollision(this.server, team.base, 41, 36, 140, 84, -25, -25)){
		
				if(this.server.team == team.name){
				
				
					this.depLog();
				
				}else{
				
					if(team.score != 0){
				
						renderer.stealText = true;
				
						if(this.action){
					
							this.stealWood(team.name);
						}

					}
				
				}

			}
			
		}.bind(this));

	}

}	

user.interactWTree = function(){
	
	renderer.treeText = false;
	
	if(!this.server.powers.papaBear){
	
		for(var i = 0; i < game.client.trees.length; i++){
			
			if(game.client.trees[i].removed == false && !this.server.dead){
			
				if(game.checkCollision(this.server, game.client.trees[i], 41, 36, 78, 78, -25, -25)){
			
					renderer.treeText = true;		
		
					if(this.action){
			
						this.chopTree(i);
			
					}	
				
				}

			}
			
		}
	}
}

user.interactWNote = function(){
	
	if(this.server.powers.papaBear) return;
	
	for (var z = 0; z < game.client.notes.length; z++){
					
		if(game.client.notes[z].removed == false){
					
			if (game.checkCollision({x: game.client.notes[z].x + 29, y: game.client.notes[z].y + 29}, this.server, 20, 20, 41, 36, 0, 0)){
				
				var redo = true;
				
				do{
					
					var chance = Math.floor(Math.random() * 100);
				
					var probability = 1;
				
					//customize this
					if(chance < 10){
						probability = 1;	
					}else{
						probability = 2;
					}
				
					var notes = noteIndex[probability].filter(function(note){
						return note.condition();
					});
				
					if(notes.length > 0) redo = false;
					
				}while(redo);
							
				var random = Math.floor(Math.random() * notes.length);

				renderer.currentNote = notes[random];

				renderer.showNote = true;
				
				if(renderer.currentNote.func) renderer.currentNote.func.apply(this, renderer.currentNote.args)

				this.getNote(z);
				
			}

		}
		
	}
	
}

user.stealWood = function(team){
	
	if(this.log.has == false){
				
		this.log.has = true;
		
		this.log.stolen = true;
		
		this.log.stolenFrom = team;
		
	    socket.emit('stealWood', {team: team});
				
 	}
	
}

user.chopTree = function(treeId){
	
	if(!this.log.has && !this.server.powers.papaBear){
		
		this.log.has = true;
		
		this.log.stolen = false;
		
		this.log.wood = 50;
		
		game.client.trees[treeId].removed = true;
	    socket.emit('chopTree', {id: treeId});
				
 	}
		
};

user.getNote = function(noteId){
			
	game.client.notes[noteId].removed = true;
	socket.emit('getNote', {id: noteId});
		
};

user.depLog = function(){
	
	if(this.log.has){
		
		this.log.has = false;
		console.log('depositing');
	   	socket.emit('depLog', {team: this.server.team, amount: this.log.wood});
	
	}
};

user.givePower = function(power){
	
	socket.emit('give_power', {name: this.name, power: power});
	
};

user.dash = function(){
	
	if(Date.now() > this.dashStart + 100 && this.dashing){
		
		this.moved = false;
		
		if(Date.now() > this.dashStart + 700){
			
			this.dashing = false;
		}
		
	}
}

user.move = function(modifier){
	
	this.dash();
	
	if((this.moved || this.dashing) && !this.dead){
		
		this.amount = 256 * modifier;
		
		if(this.server.powers.papaBear){
			
			this.amount = this.amount * 1.2;
		}
		
		if(this.dashing){
			
			this.amount = this.amount * 5;
		}
		
		socket.emit('move_input', {direction: this.direction, name: this.name, amount: this.amount});
	}
}

var getWidth = function(player){
	if (player.direction == "U" || player.direction == "D"){
		return player.weapon.vwidth;
	}else if (player.direction == "L" || player.direction == "R"){
		return player.weapon.hwidth;
	}
};

var getHeight = function(player){
	if (player.direction == "U" || player.direction == "D"){
		return player.weapon.vheight;
	}else if (player.direction == "L" || player.direction == "R"){
		return player.weapon.hheight;
	}
};