// Lib responsável por controlar o servidor HTTP
// do projeto NodeBR

var Hapi = require('hapi');
var config = require(__dirname + '/config');
var dust = require(__dirname + '/hapi-dust');
var server = new Hapi.Server(config.get('port'), {
  files: {
    relativeTo: __dirname + '/../'
  },
  views: {
    path: __dirname + '/../view',
    engines: {
      'dust': {
        module: dust,
        compileMode: 'async'
      }
    }
  }
});

module.exports = server;
