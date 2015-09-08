game.client.notes = [ 

	new Note(["If you manage to steal your opponent's wood, there is a considerable payoff."], {prob: 1, condition: 0}),

	new Note(["Press Z to dash forward"], {prob: 1, condition: 0}),

	new Note(["Press ENTER to chat with nearby users"], {prob: 1, condition: 0}),

	new Note(["You can now press 'k' to wield a deadly weapon."], 
	{prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),

	new Note(["You have picked up a knife. Press 'k' to use it, but be careful where you point it."],
	{prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),

	new Note(["Press 'k' to brandish your knife and then press 'k' again to hide it."],
	{prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}),

	new Note(["Appearances can be deceiving...stay on guard"], {prob: 1, condition: 0}),

	new Note(["You have picked up a disguise. Hold 'm' and then", 
	"press r,g or b to impersonate another team."],
	{prob: 1, condition: 0, action:{func: user.givePower, args: ["weapon"]}}), 

	new Note(["What sort of notes have your teammates read? Are they hiding something?"],
	{prob: 1, condition: 0}), 

	new Note(["Press 'k' to sheath and unsheathe a golden sword. This weapon can kill PAPA BEAR"], 
	{prob: 1, condition: function(){ return game.getPowerStats("papaBear").has&&!game.getPowerStats("powerWeapon").has}, 
	action:{func: user.givePower, args: ["powerWeapon"]} }), 

	new Note(["Someone has a special sword that can kill PAPA BEAR"], 
	{prob: 1, condition: function(){ return game.getPowerStats("papaBear").has&&game.getPowerStats("powerWeapon").has} }), 

	new Note(["Only the golden sword can defeat PAPA BEAR"], 
	 {prob: 1, condition: function(){ return game.getPowerStats("papaBear").has&&game.getPowerStats("powerWeapon").has} }), 

	new Note(["Some notes can give you immense power. This note does not."], 
	{prob: 1, condition: function(){ return !game.getPowerStats("papaBear").has} }),

	new Note(["You are now Papa Bear"], 
	{prob: 2, condition: function(){ return !game.getPowerStats("papaBear").has}, 
	action:{func: user.givePower, args: ["papaBear"]} }), 
 
];

renderer.styles = {
	"large": new Style("rgb(255,255,255)", {fontSize: 2, lineWidth: 1}),
	"block text": new Style("rgb(255,255,255)", {fontSize: 1, lineWidth: .2}),
}

renderer.UI = {
	"action prompt" : new UI("large", {x: "/4", y: "-100", width: "/2", height: "/1"}),
	"big screen" : new UI("block text", {x: "/10", y: 100, width: "/1.2", height: "-100"}),
	"game screen" : new UI("block text", {x: "/6", y: 200, width: "/1.3", height: "-200"})
}

//upload all images
var imageArray = ["bear",
"playershadow",
"swordR",
"swordL",
"swordD",
"swordU",
"counter",
"pile",
"backpacks",
"background",
"blueteam",
"greenteam",
"redteam",
"housered",
"houseblue",
"housegreen",
"pines",
"bluecorpse",
"redcorpse",
"greencorpse"];

imageArray.forEach(function(image){
	renderer.upload(image);
});