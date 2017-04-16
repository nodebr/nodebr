// Rota responsável por distribuir os arquivos estáticos
var server  = require(__dirname + '/../lib/http');

server.route({
  method: 'GET',
  path: '/public/{file*}',
  handler: {
    directory: {
      path: 'public',
      index: false
    }
  }
});

// Rota do favicon
server.route({
  method: 'GET',
  path: '/favicon.ico',
  handler: {
    file: 'public/img/favicon.ico'
  }
});
