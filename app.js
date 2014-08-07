var requi = require('requi');
var httpServer = require(__dirname + '/lib/http');

// Carregando as rotas da aplicação
requi(__dirname + '/route');

// Inicializando o servidor http
httpServer.start();
