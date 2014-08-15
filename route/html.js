// Rota responsável por distribuir o HTML
var server  = require(__dirname + '/../lib/http');

server.route({
  method: 'GET',
  path: '/',
  handler: {
    view: 'index'
  }
});

server.route({
  method: 'GET',
  path: '/noticias',
  handler: {
    view: 'news'
  }
});

server.route({
  method: 'GET',
  path: '/noticia/{slug}',
  handler: {
    view: 'news_article'
  }
});
