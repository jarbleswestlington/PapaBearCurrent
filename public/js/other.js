	if(!oPlayer.dead && !oPlayer.PAPABEAR){
		
		if (player.direction == "U"){
					
			if(game.checkCollision(oPlayer, {x: player.x - 35 + 20.5, y: player.y - 30}, 41, 36, 70, 50, 0, 0)) hit = true;
	
			if(game.checkCollision({x: player.x - 33.5, y: player.y - 9}, oPlayer, 19, 29, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x - 7, y: player.y - 35}, oPlayer 9, 5, 41, 36, 0, 0)) hit = true;
	
			if(game.checkCollision({x: player.x + 2, y: player.y - 35}, oPlayer,  35, 9, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x + 53, y: player.y - 35}, oPlayer,  9, 5, 41, 36, 0, 0)) hit = true;
				
			if(game.checkCollision({x: player.x + 54, y: player.y - 9}, oPlayer, 19, 29, 41, 36, 0, 0)) hit = true;
		
		}

		if (player.direction == "D"){
							
			if(game.checkCollision(oPlayer, {x: player.x - 35 + 20.5, y: player.y + 20}, 41, 36, 70, 50, 0, 0)) hit = true;
																	
			if(game.checkCollision({x: player.x - 33.5, y: player.y + 20}, oPlayer, 19, 29, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x - 7, y: player.y + 70}, oPlayer,  9, 5, 41, 36, 0, 0)) hit = true;
					
			if(game.checkCollision({x: player.x + 2, y: player.y + 70}, oPlayer,  35, 9, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x + 53, y: player.y + 70}, oPlayer,  9, 5, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x + 54, y: player.y + 20}, oPlayer, 19, 29, 41, 36, 0, 0)) hit = true;
		
		}

		if (player.direction == "L"){
							
			if(game.checkCollision(oPlayer, {x: player.x - 30, y: player.y - 18}, 41, 36, 50, 70, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x - 9, y: player.y + 53}, oPlayer, 29, 19, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x - 35, y: player.y - 35}, oPlayer,  5, 9, 41, 36, 0, 0)) hit = true;
								
			if(game.checkCollision({x: player.x - 39, y: player.y}, oPlayer,  9, 35, 41, 36, 0, 0)) hit = true;

			if(game.checkCollision({x: player.x - 35, y: player.y - 9}, oPlayer,  9, 5, 41, 36, 0, 0)) hit = true;
							
			if(game.checkCollision({x: player.x - 9, y: player.y - 37}, oPlayer, 29, 19, 41, 36, 0, 0)) hit = true;

		}

		if (player.direction == "R"){
							
			if(game.checkCollision(oPlayer, {x: player.x + 20, y: player.y - 18}, 41, 36, 50, 70, 0, 0)) hit = true;
					
			if(game.checkCollision({x: player.x + 20, y: player.y + 53}, oPlayer, 29, 19, 41, 36, 0, 0)) hit = true;
					
			if(game.checkCollision({x: player.x + 70, y: player.y - 35}, oPlayer,  5, 9, 41, 36, 0, 0)) hit = true;
	
			if(game.checkCollision({x: player.x + 70, y: player.y}, oPlayer, 9, 35, 41, 36, 0, 0)) hit = true;
					
			if(game.checkCollision({x: player.x + 70, y: player.y - 9}, oPlayer,  9, 5, 41, 36, 0, 0)) hit = true;
			
			if(game.checkCollision({x: player.x + 20, y: player.y - 37}, oPlayer, 29, 19, 41, 36, 0, 0)) hit = true;
		
		}
					
		if(hit){
	
			socket.emit('user_killed', {name: i});
		
		}
		
	}