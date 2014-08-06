// Rota responsável por distribuir o HTML
var server  = require(__dirname + '/../lib/http');

server.route({
  method: 'GET',
  path: '/',
  handler: function(req, res){
    res.view('index');
  }
});
