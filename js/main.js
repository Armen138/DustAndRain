/*
 * Dust And Rain - js13kgames 2014
 * @Armen138
 */

/*jshint browser:true,bitwise:false,node:true */
/*global Simplex,console*/

'use strict';
var canvas = document.getElementsByTagName('canvas')[0];

var viewPort = {
    width: window.innerWidth,
    height: window.innerHeight
};

canvas.width = viewPort.width;
canvas.height = viewPort.height;
var zoom = 1;
var fog;
var keys = {
    up: 38,
    down: 40,
    left: 37,
    right: 39
};
var offset = {
    x: 0,
    y: 0
};
var tileSize = 64;
var tilesPerScreen = {
    x: viewPort.width / tileSize | 0 + 1,
    y: viewPort.height / tileSize | 0 + 1
};
var ctx = canvas.getContext('2d');

var MessageBox = function() {
    var messages = [];
    var messageBox = {};
    var level = {
        'info': 'yellow',
        'default': 'black',
        'error': 'red',
        'warning': 'orange',
        'success': 'green'
    };
    messageBox.draw = function() {
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        for(var i = 0; i < messages.length; i++) {
            ctx.fillStyle = level[messages[i].type];
            ctx.fillText(messages[i].msg, 10, 20 + i * 20);
        }
    };
    messageBox.append = function(msg, type) {
        messages.push({
            msg: msg,
            type: type || 'default'
        });
        if(messages.length > 10) {
            messages.shift();
        }
    };
    messageBox.append('init messagebox', 'success');
    return messageBox;
};

var tiles = {
    water: {},
    rock: {},
    fire: {},
    waterInverse: {},
    rockInverse: {},
    fireInverse: {},
    grass: {}
};

var fill = [
    'water', 'grass', 'rock', 'fire'
];
var mountain = function(c) {
    c.beginPath();
    c.moveTo(16, 32);
    c.lineTo(32, 16);
    c.lineTo(48, 32);
    c.fillStyle = 'gray';
    c.strokeStyle = 'black';
    c.fill();
    c.stroke();
};
var generateTransition = function(from, to, intermediate, type) {
    var tc = document.createElement('canvas');
    var tctx = tc.getContext('2d');
    tc.width = 192;
    tc.height = 192;
    tctx.fillStyle =  from;
    tctx.fillRect(0, 0, 192, 192);
    tctx.shadowColor = intermediate;
    tctx.shadowBlur = 16;
    tctx.shadowOffsetX = 0;
    tctx.shadowOffsety = 0;
    tctx.strokeStyle = intermediate || 'brown';
    tctx.beginPath();
    tctx.moveTo(32, 64);
    tctx.quadraticCurveTo(32, 32, 64, 32);
    tctx.lineTo(128, 32);
    tctx.quadraticCurveTo(160, 32, 160, 64);
    tctx.lineTo(160, 128);
    tctx.quadraticCurveTo(160, 160, 128, 160);
    tctx.lineTo(64, 160);
    tctx.quadraticCurveTo(32, 160, 32, 128);
    tctx.lineTo(32, 64);
    tctx.lineWidth = 16;
    tctx.fillStyle = to;
    tctx.fill();
    tctx.stroke();

    var grabTile = function(name, pos) {
        tiles[type][name] = document.createElement('canvas');
        tiles[type][name].width = 64;
        tiles[type][name].height = 64;
        tiles[type][name].getContext('2d').putImageData(
            tctx.getImageData(pos.X, pos.Y, 64, 64),
            0, 0
        );
    };
    grabTile('nw', { X: 0, Y: 0 });
    grabTile('n', { X: 64, Y: 0 });
    grabTile('ne', { X: 128, Y: 0 });
    grabTile('e', { X: 128, Y: 64 });
    grabTile('sw', { X: 0, Y: 128 });
    grabTile('s', { X: 64, Y: 128 });
    grabTile('se', { X: 128, Y: 128 });
    grabTile('w', { X: 0, Y: 64 });
    //grabTile('c', {X: 64, Y: 64 });
    tiles[type].c = document.createElement('canvas');
    tiles[type].c.width = 64;
    tiles[type].c.height = 64;
    tiles[type].c.getContext('2d').fillStyle = to;
    tiles[type].c.getContext('2d').fillRect(0, 0, 64, 64);
    if(type === 'rock') {
        mountain(tiles[type].c.getContext('2d'));
    }
    //document.body.appendChild(tc);
};

var Unit = function(x, y/*, type*/) {
    var unit = {};
    var fx, fy;
    var fogBox = function(r, v) {
        for(fx = x - r; fx <= x + r; fx++) {
            for(fy = y - r; fy <= y + r; fy++) {
                if(fog[fx][fy] < v) {
                    fog[fx][fy] = v;
                }
            }
        }
    };
    fogBox(2, 1);
    fogBox(1, 2);
    unit.draw = function() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect((x - offset.x) * tileSize * zoom, (y - offset.y) * tileSize * zoom, tileSize * zoom, tileSize * zoom);
    };
    return unit;
};
var Player = function() {
    var x = Math.random() * 100 | 0;
    var y = Math.random() * 100 | 0;
    var type = 'settler';
    var unit = new Unit(x, y, type);
    var player = {};
    player.draw = function() {
        unit.draw();
    };
    player.start = {
        x: x,
        y: y
    };
    return player;
};

var World = function(map) {
    var selected = null;
    var events = {};
    var world = {};
    fog = [];
    var size = {
        width: 100,
        height: 100
    };
    var ev = function(e, data) {
        if(events[e]) {
            for(var i = 0; i < events[e].length; i++) {
                events[e][i](data);
            }
        }
    };
    for(var x = 0; x < size.width; x++) {
        fog[x] = [];
        for(var y = 0; y < size.height; y++) {
            fog[x][y] = 0;
        }
    }
    var drag = null;
    var tilePosition = function(ip) {
        var p = {
            x: (ip.x / (tileSize * zoom) | 0) + offset.x,
            y: (ip.y / (tileSize * zoom) | 0) + offset.y
        };
        return p;
    };
    var setZoom = function(z) {
        if(z> 2) {
            return;
        }
        if((viewPort.width / (tileSize * z) | 0 + 1) >= size.width ||
            (viewPort.height / (tileSize * z) | 0 + 1) >= size.height) {
               return;
        }
        zoom = z;
        tilesPerScreen = {
            x: (viewPort.width / (tileSize * zoom) | 0) + 1,
            y: (viewPort.height / (tileSize * zoom) | 0) + 1
        };
        //console.log(offset);
        //console.log(tilesPerScreen);
    };
    document.addEventListener('mousewheel', function(e) {
        var p = tilePosition({ x: e.clientX, y: e.clientY });
        if(e.wheelDelta < 0) {
            //console.log('wheel down');
            setZoom(zoom * 0.5);
        } else {
            //console.log('wheel up');
            setZoom(zoom * 2);
        }
        if(tilesPerScreen.x >  size.width ||
            tilesPerScreen.y > size.height) {
            setZoom(zoom * 2);
        }
        world.center(p.x, p.y);
    });
    document.addEventListener('mousedown', function(e) {
        //console.log(e.which);
        if(e.which === 3) {
            drag = {
                X: e.clientX,
                Y: e.clientY,
                oX: offset.x,
                oY: offset.y
            };
        }
    });

    document.addEventListener('mousemove', function(e) {
        if(!drag) {
            return;
        }
        var tileDif = {
            X: (drag.X - e.clientX) / (tileSize * zoom) | 0,
            Y: (drag.Y - e.clientY) / (tileSize * zoom) | 0
        };
        offset.x = tileDif.X + drag.oX;
        offset.y = tileDif.Y + drag.oY;
        if(offset.x > size.width - tilesPerScreen.x - 1) {
            offset.x = size.width - tilesPerScreen.x - 1;
        }
        if(offset.y > size.height - tilesPerScreen.y - 1) {
            offset.y = size.height - tilesPerScreen.y - 1;
        }
        if(offset.x < 0) {
            offset.x = 0;
        }
        if(offset.y < 0) {
            offset.y = 0;
        }
    });

    document.addEventListener('mouseup', function() {
        drag = null;
    });
    document.addEventListener('click', function(e) {
        var p = tilePosition({ x: e.clientX, y: e.clientY });
        //console.log(p);
        ev('action', p);
    });
    document.addEventListener('keydown', function(e) {
        //console.log(e.which);
        switch(e.which) {
            case keys.right:
                offset.x++;
                if(offset.x > size.width - tilesPerScreen.x - 1) {
                    offset.x = size.width - tilesPerScreen.x - 1;
                }
                break;
            case keys.left:
                if(offset.x > 0) {
                    offset.x--;
                }
                break;
            case keys.up:
                if(offset.y > 0) {
                    offset.y--;
                }
                break;
            case keys.down:
                offset.y++;
                if(offset.y > size.height - tilesPerScreen.y - 1) {
                    offset.y = size.height - tilesPerScreen.y - 1;
                }
                break;
        }
    });

    var mapCorner = function(x, y) {
        var type = fill[map[x][y]];
        var b;

        if(type === 'grass') {
            return tiles[type].c;
        }
        //if(type === 'rock') {
            //return tiles[type].c;
        //}
        if(x > 0 && y > 0) {
            if(map[x][y] !== map[x - 1][y] &&
               map[x][y] !== map[x][y -1]) {
                b = map[x][y - 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                //nw
                return tiles[type].nw;
            }
        }

        if(x < size.width - 1 && y > 0) {
            if(map[x][y] !== map[x + 1][y] &&
               map[x][y] !== map[x][y -1]) {
                b = map[x][y - 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                //ne
                return tiles[type].ne;
            }
        }
        if(x < size.width - 1 && y < size.height) {
            if(map[x][y] !== map[x + 1][y] &&
               map[x][y] !== map[x][y  + 1]) {
                b = map[x][y + 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                //ne
                return tiles[type].se;
            }
        }
        if(x > 0 && y < size.height - 1) {
            if(map[x][y] !== map[x - 1][y] &&
               map[x][y] !== map[x][y  + 1]) {
                b = map[x][y + 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                //ne
                return tiles[type].sw;
            }
        }
        if(x > 0 && y > 0) {
            if(map[x][y] !== map[x - 1][y - 1] &&
               map[x][y] === map[x - 1][y] &&
               map[x][y] === map[x][y - 1]) {
                b = map[x - 1][y - 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type + 'Inverse'].se;
            }
        }
        if(x < size.width - 1 && y > 0) {
            if(map[x][y] !== map[x + 1][y - 1] &&
               map[x][y] === map[x + 1][y] &&
               map[x][y] === map[x][y - 1]) {
                b = map[x + 1][y - 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type + 'Inverse'].sw;
            }
        }
        if(x > 0 && y < size.height - 1) {
            if(map[x][y] !== map[x - 1][y + 1] &&
               map[x][y] === map[x - 1][y] &&
               map[x][y] === map[x][y + 1]) {
                b = map[x - 1][y + 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type + 'Inverse'].ne;
            }
        }
        if(x < size.width - 1 && y < size.height - 1) {
            if(map[x][y] !== map[x + 1][y + 1] &&
               map[x][y] === map[x + 1][y] &&
               map[x][y] === map[x][y + 1]) {
                b = map[x + 1][y + 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type + 'Inverse'].nw;
            }
        }
        if(x > 0) {
            if(map[x][y] !== map[x - 1][y]) {
                b = map[x - 1][y];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type].w;
            }
        }
        if(x < size.width - 1) {
            if(map[x][y] !== map[x + 1][y]) {
                b = map[x + 1][y];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type].e;
            }
        }
        if(y > 0) {
            if(map[x][y] !== map[x][y - 1]) {
                b = map[x][y - 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type].n;
            }
        }
        if(y < size.height - 1) {
            if(map[x][y] !== map[x][y + 1]) {
                b = map[x][y + 1];
                if(type === 'rock' && b === 3) {
                    return tiles[type].c;
                }
                return tiles[type].s;
            }
        }
        return tiles[type].c;
    };
    world.draw = function() {
        offset.x = Math.min(Math.max(offset.x, 0), size.width - tilesPerScreen.x);
        offset.y = Math.min(Math.max(offset.y, 0), size.height - tilesPerScreen.y);
        for(var x = offset.x; x < tilesPerScreen.x + offset.x; x++) {
            for(var y = offset.y; y < tilesPerScreen.y + offset.y; y++) {
                var tile = mapCorner(x, y);
                ctx.drawImage(tile,
                    0, 0, tileSize, tileSize,
                    (x - offset.x) * (tileSize * zoom), (y - offset.y) * (tileSize * zoom),
                    tileSize * zoom, tileSize * zoom
                );
                ctx.fillStyle = 'rgba(0,0,0,' + ((1 - fog[x][y] * 0.5) * 0.75)+ ')';
                ctx.fillRect((x - offset.x) * tileSize * zoom, (y - offset.y) * tileSize * zoom, tileSize * zoom, tileSize * zoom);
            }
        }
        if(selected) {
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect((selected.x - offset.x) * tileSize * zoom,
                            (selected.y - offset.y) * tileSize * zoom, tileSize * zoom, tileSize * zoom);
        }
    };
    world.center = function(x, y) {
        var c = {
            x: tilesPerScreen.x / 2 | 0,
            y: tilesPerScreen.y / 2 | 0
        };
        offset.x = x - c.x; //Math.min(Math.max(x - c.x, 0), size - tilesPerScreen.x);
        offset.y = y - c.y; //Math.min(Math.max(y - c.y, 0), size - tilesPerScreen.y);
    };
    world.on = function(ev, cb) {
        if(!events[ev]) {
            events[ev] = [];
        }
        events[ev].push(cb);
    };
    world.select = function(p) {
        selected = p;
    };
    //console.log(map);
    return world;
};

var Game = function() {
    var messageBox = new MessageBox();
    var server = new Server();
    var game = {
        loop: function() {
            window.requestAnimationFrame(game.loop);
        }
    };

    server.on('map', function(data) {
        //console.log(data);

        var world = new World(data);
        var player = new Player();
        world.on('action', function(p) {
            world.select(p);
        });
        world.center(player.start.x, player.start.y);
        server.on('msg', function(data) {
            console.log('message from server');
            console.log(data);
            messageBox.append(data.data);
        });

        var draw = function() {
            canvas.width = canvas.width;
        };

        game.loop = function() {
            draw();
            world.draw();
            player.draw();
            messageBox.draw();
            window.requestAnimationFrame(game.loop);
        };
    });
    server.send('map');
    return game;
};

var Server = function() {
    var server = {},
        events = {},
        ev = function(e, data) {
            if(events[e]) {
                for(var i = 0; i < events[e].length; i++) {
                    events[e][i](data);
                }
            }
        },
        serverWorker = new Worker('server/server.min.js');
    server.send = function(type, message) {
        serverWorker.postMessage({
            type: type || 'info',
            data: message
        });
    };
    server.on = function(e, cb) {
        if(!events[e]) {
            events[e] = [];
        }
        events[e].push(cb);
    };

    serverWorker.onmessage = function(data) {
        ev('msg', data.data);
        if(data.data.type) {
            ev(data.data.type, data.data.data);
        }
    };
    serverWorker.postMessage({
        type: 'info',
        data: 'connection ready'
    });
    return server;
};

generateTransition('green', 'blue', 'brown', 'water');
generateTransition('blue', 'green', 'brown', 'waterInverse');
generateTransition('blue', 'green', 'brown', 'grass');
generateTransition('grey', '#C91B0E', 'black', 'fire');
generateTransition('#C91B0E', 'grey', 'black', 'fireInverse');

//generateTransition('#C91B0E', 'grey', 'black', 'rock');
generateTransition('green', 'grey', '#0B5C16', 'rock');
generateTransition('grey', 'green', '#0B5C16', 'rockInverse');
//generateTransition('grey', '#C91B0E', 'black', 'rockInverse');
var game = new Game();
game.loop();
