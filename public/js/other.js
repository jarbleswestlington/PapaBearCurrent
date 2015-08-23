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
	
	
	
		case 9:
						if (game.lastMessage == messageNum){
						game.messageReset = true;
						}
						else{
						noteMessage.line1 = "Some notes can give you immense power. This note does not.";
						noteMessage.line2 = "";
						noteMessage.line3 = "";
						noteMessage.line4 = "";
						game.lastMessage = messageNum;
						}
					break;
					case 10:
						if (game.lastMessage == messageNum){
						game.messageReset = true;
						}
						else{
						noteMessage.line1 = "Hold 'm' and press r,g, or b.";
						noteMessage.line2 = "Not everyone can disguse themselves...but some of your enemies can.";
						noteMessage.line3 = "";
						noteMessage.line4 = "";
						game.lastMessage = messageNum;
						GiveCanDisguise(users[username]);

						}
					
					break;

					case 11:

					if(!checkIfPapa()){
						
					noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
					noteMessage.line2 = "You are fast, deadly, and nearly invincible";
					noteMessage.line3 = "You can only be killed by a golden sword";
					noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
					GivePapa(users[username], z);
					hasLog = false;
					
					}else{
					
						noteMessage.line1 = "Papa Bear can be a powerful ally, but can you trust him?";
						noteMessage.line2 = "";
						hasWeapon = true;


						
					}
					
					break;

					case 12:

					if(!checkIfPapa()){
						
					noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
					noteMessage.line2 = "You are fast, deadly, and nearly invincible";
					noteMessage.line3 = "You can only be killed by a golden sword";
					noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
					GivePapa(users[username], z);
					
					}else{
					noteMessage.line1 = "Papa Bear has a secret..";
					noteMessage.line2 = "";
					hasWeapon = true;

					}
					break;

					case 13:
					if(!checkIfPapa()){
						
						noteMessage.line1 = "By reading this note you have transformed into PAPA BEAR, the king of the forest.;"
						noteMessage.line2 = "You are fast, deadly, and nearly invincible";
						noteMessage.line3 = "You can only be killed by a golden sword";
						noteMessage.line4 = "Will you help your former team or embrace your frightening nature?";
						GivePapa(users[username], z);
						hasLog = false;
						hasWeapon = true;

					}else{
						noteMessage.line1 = "The woods contain a note which can be used to kill Papa Bear";
						noteMessage.line2 = "";

					}
					break;

					case 14:

					if(!checkIfSwordBearer()){
						noteMessage.line1 = "Press 'k' to sheath and unsheathe a golden sword. This weapon can kill PAPA BEAR.";
						noteMessage.line2 = "";
						hasWeapon = true;

						GivePowerSword(users[username]);
					}else{
						noteMessage.line1 = "Only the golden sword can defeat PAPA BEAR.";
						noteMessage.line2 = "";

					}

					break;

					case 15:

					if(!checkIfSwordBearer()){
					noteMessage.line1 = "Press 'k' to sheath and unsheathe a golden sword. This weapon can kill PAPA BEAR.";
					GivePowerSword(users[username]);
					}else{
					noteMessage.line1 = "Right now someone has the golden sword that could defeat PAPA BEAR...";
					}
		
					case 16:
					noteMessage.line1 = "You have picked up a disguise. Hold 'm' and then";
					noteMessage.line2 = "press r,g or b to impersonate another team.";
					GiveCanDisguise(users[username]);
					break;

					case 17:

					noteMessage.line1 = "What sort of notes have your teammates read? Are they hiding something?";

					break;
					}