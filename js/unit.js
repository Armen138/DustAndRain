
var Unit = function(p, type, owner, world) {
    var types = {
        settler: {
            moves: 4,
            context: {
                settle: function() {
                    console.log('settle settlement');
                    queue = [];
                    queue.push({
                        action: 'settle'
                    });
                },
                move: function() { selection.defaultAction = 'move'; }
            }
        },
        knight: {
            moves: 8,
            context: {
                move: function() { selection.defaultAction = 'move'; },
                attack: function() { selection.defaultAction = 'attack'; }
            }
        },
        chief: {
            moves: 6,
            context: {
                move: function() { selection.defaultAction = 'move'; },
                attack: function() { selection.defaultAction = 'attack'; },
                conquer: function() { selection.defaultAction = 'conquer'; }
            }
        },
        city: {
            moves: 1,
            palace: 1,
            quarry: 1,
            aquaduct: 1,
            forge: 1,
            mill: 1,
            context: {
                '⇮ palace': function() { queue.push({ action: 'palace', turns: unit.palace * 5 }); },
                '⇮ quarry': function() { queue.push({ action: 'quarry', turns: unit.quarry * 2 }); },
                '⇮ aquaduct': function() { queue.push({ action: 'aquaduct', turns: unit.aquaduct * 2 }); },
                '⇮ forge': function() { queue.push({ action: 'forge', turns: unit.forge * 2 }); },
                '⇮ mill': function() { queue.push({ action: 'mill', turns: unit.mill * 2 }); },
                '♘ knight': function() { queue.push({ action: 'knight', turns: unit.mill * 2 }); },
                '♔ chief': function() { queue.push({ action: 'chief', turns: unit.mill * 2 }); },
                '♗ settler': function() { queue.push({ action: 'settler', turns: unit.mill * 2 }); },
            }
        }
    };
    var unit = {
        owner: owner,
        position: p
    };
    var queue = [];
    var fx, fy;
    type = type || 'settler';
    unit.type = type;
    //var icon = '\u2657';
    var tooltip = type;
    ctx.font = '20px sans-serif';
    var tipWidth = ctx.measureText(tooltip).width;
    var fogBox = function(r, v) {
        for(fx = p.x - r; fx <= p.x + r; fx++) {
            for(fy = p.y - r; fy <= p.y + r; fy++) {
                if(fog[fx][fy] < v) {
                    fog[fx][fy] = v;
                }
            }
        }
    };

    unit.inside = function(pos) {
        return (pos.x === p.x && pos.y === p.y);
        //var x = (p.x) * tileSize * zoom,
            //y = (p.y) * tileSize * zoom;
        //return (pos.x > x &&
                //pos.x < x + tileSize * zoom &&
                //pos.y > y &&
                //pos.y < y + tileSize * zoom);
    };

    fogBox(2, 1);
    fogBox(1, 2);

    unit.draw = function() {
        var x = (p.x - offset.x) * tileSize * zoom,
            y = (p.y - offset.y) * tileSize * zoom;
        ctx.fillStyle = 'yellow';
        ctx.fillRect(x, y, tileSize * zoom, tileSize * zoom);
        ctx.drawImage(icons[type], 0, 0, tileSize, tileSize, x, y, tileSize * zoom, tileSize * zoom);
        //ctx.fillStyle = 'black';
        //ctx.font = '48px sans-serif';
        //ctx.textBaseline = 'hanging';
        //ctx.fillText(icon, x + 8, y + 8);
        ctx.fillStyle = 'red';
        if(queue.length > 0) {
            for(var i = 0; i < queue.length; i++) {
                if(queue[i].action === 'move') {
                    var mx = (queue[i].position.x - offset.x) * tileSize * zoom,
                        my = (queue[i].position.y - offset.y) * tileSize * zoom;
                    ctx.fillRect(mx + 10 * zoom,
                            my + 10 * zoom,
                            (tileSize - 20) * zoom,
                            (tileSize - 20) * zoom);
                }
            }
        }

        if(unit.drawTooltip) {
            ctx.font = '20px sans-serif';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.fillRect(x + tileSize * zoom, y,  tipWidth + 8, 25);
            ctx.strokeRect(x + tileSize * zoom, y,  tipWidth + 8, 25);
            ctx.textBaseline = 'hanging';
            ctx.fillStyle = 'black';
            ctx.fillText(tooltip, x + 4 + tileSize * zoom, y + 4);
        }
    };
    unit.action = function(action, position) {
        console.log('requested ' + action + ' on unit.');
        if(action === 'move') {
            queue = [];
            var path = world.path(p, position);
            path.shift(); //first position is the unit
            for(var i = 0; i < path.length; i++) {
                queue.push({
                    action: 'move',
                    position: { x: path[i].X, y: path[i].Y }
                });
            }
        }
    };

    unit.runQueue = function() {
        console.log('run unit queue: ' + unit.moves);
        for(var i = 0; i < unit.moves; i++) {
            if(queue.length > 0) {
                if(queue[0].action === 'move') {
                    p = queue[0].position;
                    fogBox(2, 1);
                    fogBox(1, 2);
                }
                if(queue[0].action === 'settle') {
                    unit.type = tooltip = type = 'city';
                    for(var prop in types[type]) {
                        unit[prop] = types[type][prop];
                    }
                    unit.income = {
                        water: 1,
                        fire: 1,
                        rock: 1,
                        air: 1
                    };
                }
                queue.shift();
            }
        }
    };
    for(var prop in types[type]) {
        unit[prop] = types[type][prop];
    }
    //unit.context.move = function() {
        //selection.defaultAction = 'move';
    //};
    //unit.context.fortify = function() {};
    //unit.context.attack = function() {
        //selection.defaultAction = 'attack';
    //};
    return unit;
};

