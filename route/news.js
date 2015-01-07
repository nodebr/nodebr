// Rota responsável por distribuir o HTML
var server  = require(__dirname + '/../lib/http');
var rss  = require(__dirname + '/../lib/rss');
var News = require('mongoose').model('news');

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

server.route({
  method: 'GET',
  path: '/noticias/novo',
  handler: {
    view: 'new_news'
  }
});
 
server.route({
  method: 'GET',
  path: '/noticia/rss',
  handler: function(req, res){
    News.find({}, function(err, news){
      if(err)
        throw err;
 
      rss.addItems(news);
      
      res(rss.getRSS())
      .type('text/xml');
    });
  }
});