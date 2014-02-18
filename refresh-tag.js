var port = process.env.HOT_RELOAD_BROWSER_REFRESH_PORT;
var enabled = !!port;
var html;

if (enabled) {
    html = require('fs')
        .readFileSync(require('path').join(__dirname, 'refresh.html'), {encoding: 'utf8'})
        .replace(/PORT/g, port);
}

exports.render = function(input, context) {
    if (enabled && input.enabled !== false) {
        context.write(html);
    }
};