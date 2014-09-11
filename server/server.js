//console.log('server started');
var simplex = new Simplex();
var playerId = 0;
var players = {};
var size = {
    width: 100,
    height: 100
};

var mapTile = function(x, y) {
    var res = 25;
    var levels = 4;
    return parseInt((simplex.noise(x / res, y / res) + 1) / 2 * levels, 10);
};

var generateMap = function() {
    var map = [];
    for(var x = 0; x < size.width; x++) {
        map[x] = [];
        for(var y = 0; y < size.height; y++) {
            map[x][y] = mapTile(x / 2 | 0, y / 2 | 0);
        }
    }
    return map;
};

var Connection = function() {
    var events = {};
    var ev = function(e, data) {
        if(events[e]) {
            for(var i = 0; i < events[e].length; i++) {
                events[e][i](data);
            }
        }
    };
    var connection = {
        on: function(e, cb) {
            if(!events[e]) {
                events[e] = [];
            }
            events[e].push(cb);
        },
        send: function(type, msg) {
            self.postMessage({
                type: type || 'info',
                data: msg
            });
        }
    };
    self.onmessage = function(data) {
        ev('msg', data.data);
        if(data.data.type) {
            ev(data.data.type, data.data.data);
        }
    };

    self.postMessage({
        type: 'info',
        data: 'MOTD: Welcome to Dust&Rain server v0.1'
    });
    return connection;
};

var Game = function() {
    var game = {};
    var map = generateMap();
    var connection = new Connection();

    var findSpawn = function(x, y, w, h) {
        var spawn = {
            x: (Math.random() * w | 0) + w,
            y: (Math.random() * h | 0) + h
        };
        if(map[spawn.x][spawn.y] === 2 ||
            map[spawn.x][spawn.y] === 1) {
            return findSpawn(x, y, w, h);
        }
        return spawn;
    };

    var spawns = [
        findSpawn(0, 0, 50, 50),
        findSpawn(0, 50, 50, 50),
        findSpawn(50, 50, 50, 50),
        findSpawn(50, 0, 50, 50)
    ];

    connection.on('map', function(data) {
        connection.send('map', map);
    });
    connection.on('player', function(data) {
        if(spawns.length > 0) {
            var player = new Player(data, spawns.splice(0, 1), connection);
            players[player.id] = player;
        } else {
            connection.send('full');
        }
    });
    return game;
};

var game = new Game();

