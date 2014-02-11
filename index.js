var io = require('socket.io');
var DEFAULT_PORT = 8999;
var fs = require('fs');

var nodePath = require('path');

console.log("PLUGIN BEING RELOADED!");

exports = module.exports = function(hotReload, config) {

    console.log("REFRESH PLUGIN BEGIN");
    exports.port = config.port || DEFAULT_PORT;

    exports.html = fs
        .readFileSync(nodePath.join(__dirname, 'refresh.html'), {encoding: 'utf8'})
        .replace(/PORT/g, exports.port);

    var io = require('socket.io').listen(exports.port, { log: false }, function() {
        console.log("REFRESH PLUGIN ENABLED");
        exports.enabled = true;
    });

    io.sockets.on('connection', function (socket) {

        function emitModified(eventArgs) {
            socket.emit('modified', {path: eventArgs.path});
        }

        hotReload.afterReload(emitModified)
            .afterSpecialReload(emitModified);

        socket.on('disconnect', function () {
            hotReload.removeListener('afterReload', emitModified);
            hotReload.removeListener('afterSpecialReload', emitModified);
        });
    });
};

exports.enabled = false;
exports.html = null;
exports.port = null;