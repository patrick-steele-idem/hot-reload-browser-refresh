var io = require('socket.io');
var DEFAULT_PORT = 8999;
var fs = require('fs');
var q = require('q');

var nodePath = require('path');
var DEFAULT_DELAY = 500;

exports = module.exports = function(hotReload, config) {
    var port = config.port || DEFAULT_PORT;

    var io = require('socket.io').listen(port, { log: false });

    var readyEvent = config['ready-event'] || config.readyEvent || 'ready';

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
        var ready = false;
        var delay = config.delay || DEFAULT_DELAY;

        var timeoutId = setTimeout(function() {
            if (ready) {
                return;
            }
            hotReload.log('Waited ' + delay + 'ms without receiving "' + readyEvent + '" from child process. Triggering page refresh...');
            ready = true;
            deferred.resolve();
        }, delay);

        hotReload.childProcess.once('message', function(message) {
            if (ready) {
                return;
            }

            if (message === readyEvent) {
                clearTimeout(timeoutId);
                hotReload.log('Server is ready. Triggering page refresh...');
                ready = true;
                deferred.resolve();
            }
        });

        hotReload.waitFor(deferred.promise);
    });
};