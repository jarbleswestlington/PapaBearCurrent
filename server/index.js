var game = require('./game/game');

var app = require("./app/index")(game);

var server = app.listen(process.env.PORT || 3000);
var io = require('./game/sockets')(server, game).io;

require('./game/config')(game, io);


