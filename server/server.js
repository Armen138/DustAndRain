console.log('server started');
var simplex = new Simplex();

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

    connection.on('msg', function(data) {
        console.log(JSON.stringify(data));
        switch(data.type) {
            case 'map':
                connection.send('map', map);
                break;
            default:
                console.log('unknown message type: ' + data.type);
                break;
        }
    });
    return game;
};

var game = new Game();

