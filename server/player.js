var Unit = function(spawn) {
    var unit = {
        position: spawn,
        moves: 4,
        done: 0,
        reset: function() {
            unit.done = 0;
        }
    };
    return unit;
};

var Player = function(data, spawn, connection) {
    var player = {
        id: playerId++,
        units: []
    };

    for(var p in data) {
        player[p] = data[p];
    }

    connection.on('player-event', function(data) {
        if(data.playerId === player.id) {
            ev(data.playerEvent, data.eventData);
        }
    });
    player.units.push(new Unit(spawn));
    //connection.send(unit);
    return player;
};
