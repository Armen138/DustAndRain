/*
 * Dust And Rain - js13kgames 2014
 * @Armen138
 */

/*jshint browser:true,bitwise:false,node:true */
/*global Simplex,console*/

'use strict';
var canvas = document.getElementsByTagName('canvas')[0];
var simplex = new Simplex();
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

var mapTile = function(x, y) {
    var res = 25;
    var levels = 4;
    return parseInt((simplex.noise(x / res, y / res) + 1) / 2 * levels, 10);
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
    for(fx = x - 2; fx <= x + 2; fx++) {
        for(fy = y - 2; fy <= y + 2; fy++) {
            if(fog[fx][fy] === 0) {
                fog[fx][fy] = 2;
            }
        }

    }
    for(fx = x - 1; fx <= x + 1; fx++) {
        for(fy = y - 1; fy <= y + 1; fy++) {
            fog[fx][fy] = 1;
        }
    }
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
    return player;
};

var World = function() {
    console.log(simplex);
    var world = {};
    var map = [];
    fog = [];
    var size = {
        width: 100,
        height: 100
    };
    for(var x = 0; x < size.width; x++) {
        map[x] = [];
        fog[x] = [];
        for(var y = 0; y < size.height; y++) {
            map[x][y] = mapTile(x / 2 | 0, y / 2 | 0);
            fog[x][y] = 0;
        }
    }
    var drag = null;
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
        console.log(offset);
        console.log(tilesPerScreen);
    };
    document.addEventListener('mousewheel', function(e) {
        if(e.wheelDelta < 0) {
            //up
            console.log('wheel down');
            setZoom(zoom * 0.5);
        } else {
            console.log('wheel up');
            setZoom(zoom * 2);
        }
        if(tilesPerScreen.x >  size.width ||
            tilesPerScreen.Y > size.height) {
            setZoom(zoom * 2);
        }
        //if(offset.x > size.width - tilesPerScreen.x) {
            //offset.x = size.width - tilesPerScreen.x;
        //}
        //if(offset.y > size.width - tilesPerScreen.y) {
            //offset.y = size.width - tilesPerScreen.y;
        //}
        console.log(offset);
        console.log(tilesPerScreen);
    });
    document.addEventListener('mousedown', function(e) {
        console.log(e.which);
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
    document.addEventListener('keydown', function(e) {
        console.log(e.which);
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
        //var colors = ['red', 'green', 'blue', 'gray'];
        for(var x = offset.x; x < tilesPerScreen.x + offset.x; x++) {
            for(var y = offset.y; y < tilesPerScreen.y + offset.y; y++) {
                var tile = mapCorner(x, y);
                //ctx.drawImage(tile, (x - offset.x) * tileSize, (y - offset.y) * tileSize);
                ctx.drawImage(tile,
                    0, 0, tileSize, tileSize,
                    (x - offset.x) * (tileSize * zoom), (y - offset.y) * (tileSize * zoom),
                    tileSize * zoom, tileSize * zoom
                );
                //ctx.save();
                //ctx.fillStyle = colors[map[x][y]];
                //ctx.globalAlpha = 0.3;
                //ctx.fillRect((x - offset.x) * tileSize, (y - offset.y) * tileSize, tileSize, tileSize);
                //ctx.restore();

                //ctx.strokeStyle = 'black';
                //ctx.strokeRect((x - offset.x) * tileSize, (y - offset.y) * tileSize, tileSize, tileSize);
                if(fog[x][y] === 0) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                    ctx.fillRect((x - offset.x) * tileSize * zoom, (y - offset.y) * tileSize * zoom, tileSize * zoom, tileSize * zoom);
                }
                if(fog[x][y] === 2) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                    ctx.fillRect((x - offset.x) * tileSize * zoom, (y - offset.y) * tileSize * zoom, tileSize * zoom, tileSize * zoom);
                }
            }
        }
    };
    console.log(map);
    return world;
};

var Game = function() {
    var world = new World();
    var player = new Player();
    var draw = function() {
        canvas.width = canvas.width;
    };

    var loop = function() {
        draw();
        world.draw();
        player.draw();
        window.requestAnimationFrame(loop);
    };

    return {
        loop: loop
    };
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
