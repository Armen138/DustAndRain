
var Unit = function(p, type, owner) {
    var types = {
        settler: {
            moves: 4,
            context: {
                settle: function() { console.log('settle settlement'); },
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
                '⇮ palace': function() { queue.add({ action: 'palace', turns: unit.palace * 5 }); },
                '⇮ quarry': function() { queue.add({ action: 'quarry', turns: unit.quarry * 2 }); },
                '⇮ aquaduct': function() { queue.add({ action: 'aquaduct', turns: unit.aquaduct * 2 }); },
                '⇮ forge': function() { queue.add({ action: 'forge', turns: unit.forge * 2 }); },
                '⇮ mill': function() { queue.add({ action: 'mill', turns: unit.mill * 2 }); },
            }
        }
    };
    var unit = {
        owner: owner
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

