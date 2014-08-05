// Lib responsável por controlar o servidor HTTP
// do projeto NodeBR

var Hapi = require('hapi');
var config = require(__dirname + '/config');
var server = new Hapi.Server(config.get('port'), {
  files: {
    relativeTo: __dirname + '/../'
  }
});

module.exports = server;
