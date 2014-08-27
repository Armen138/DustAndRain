console.log('server started');
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

var connection = new Connection();
connection.on('msg', function(data) {
    console.log(JSON.stringify(data));
});
