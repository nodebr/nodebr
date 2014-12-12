// Lib responsável por controlar o servidor HTTP
// do projeto NodeBR

var Hapi = require('hapi');
var config = require(__dirname + '/config');
var dust = require(__dirname + '/hapi-dust');
var server = new Hapi.Server();

server.connection({host: '0.0.0.0', port: config.get('port')});
server.views({
  relativeTo: __dirname + '/../',
  path: __dirname + '/../view',
  engines: {
    'dust': {
      module: dust,
      compileMode: 'async'
    }
  }
});

module.exports = server;
