var plugin = require('./index');

exports.render = function(input, context) {
    if (plugin.enabled && input.enabled !== false) {
        context.write(plugin.html);
    }
};