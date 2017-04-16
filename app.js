var requi = require('requi');
var httpServer = require(__dirname + '/lib/http');
var log = require(__dirname + '/lib/log');
var config = require(__dirname + '/lib/config');
var db = require(__dirname + '/lib/db');

// Carregando os models
requi(__dirname + '/model');

// Carregando as rotas da aplicação
requi(__dirname + '/route');

// Esperamos o banco de dados conectar
db.connection.on('connected', function(){
  log.info('Banco de dados conectado.');

  // Inicializando o servidor http
  httpServer.start(function(err){
    if(err)
      throw err;

    log.info('Servidor iniciado na porta ' + httpServer.info.port +
      ' no modo ' + config.get('mode'));
  });
});