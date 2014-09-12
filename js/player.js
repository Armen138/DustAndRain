var Player = function(world) {
    var x, y;
    var type = 'settler';
    var units = [];
    var resources = {
        water: 0,
        rock: 0,
        fire: 0,
        air: 0
    };
    var spawn = function() {
        x = Math.random() * 100 | 0;
        y = Math.random() * 100 | 0;
        if(world.collides(x, y)) {
            spawn();
        }
    };
    spawn();
    //var unit = new Unit({x: x, y: y}, type);
    units.push(new Unit({x: x, y: y}, type, player, world));
    var player = {};
    player.draw = function() {
        for(var i = 0; i < units.length; i++) {
            units[i].drawTooltip = units[i].inside(mouse);
            units[i].draw();
        }
    };
    player.unitAt = function(p) {
        for(var i = 0; i < units.length; i++) {
            if(units[i].inside(p)) {
                return units[i];
            }
            //if(units[i].position.x === p.x &&
                //units[i].position.y === p.y) {
                //return units[i];
            //}
        }
        return null;
    };
    player.units = units;
    player.start = {
        x: x,
        y: y
    };
    player.resources = function() {
        return resources;
    };
    player.endTurn = function() {
        for(var i = 0; i < units.length; i++) {
            units[i].runQueue();
            if(units[i].income) {
                for(var r in units[i].income) {
                    resources[r] += units[i].income[r];
                }
            }
        }
    };
    return player;
};
