// Rota responsável por distribuir o HTML
var server  = require(__dirname + '/../lib/http');

server.route({
  method: 'GET',
  path: '/',
  handler: {
    file: 'view/main.html'
  }
});
