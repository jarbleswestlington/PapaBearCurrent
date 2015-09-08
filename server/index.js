//socket org -- elephant and all the naming
//file names/ dependency injections
//master player
//spectator
//collisions with bases
//setup Server
var game = require('./game/game');

var app = require("./app/index")(game);

require('./game/config')(game);

var server = app.listen(process.env.PORT || 3000);
require('./game/sockets')(server, game);
