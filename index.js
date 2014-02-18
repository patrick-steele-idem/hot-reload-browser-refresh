var io = require('socket.io');
var DEFAULT_PORT = 8999;
var fs = require('fs');
var q = require('q');

var nodePath = require('path');

exports = module.exports = function(hotReload, config) {
    var port = config.port || DEFAULT_PORT;

    var io = require('socket.io').listen(port, { log: false });

    var readyEvent = config['ready-event'] || 'ready';

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

    hotReload.childProcessEnv.HOT_RELOAD_BROWSER_REFRESH_PORT = port;

    hotReload.on('reload', function() {
        if (!hotReload.childProcess) {
            return;
        }

        var deferred = q.defer();
        hotReload.childProcess.once('message', function(message) {
            hotReload.log('Server is ready. Triggering page refresh...');
            if (message === readyEvent) {
                deferred.resolve();
            }
        });
        hotReload.waitFor(deferred.promise);
    });
};