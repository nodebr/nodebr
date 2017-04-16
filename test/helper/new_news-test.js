
// Testar o helper que renderiza as notícias
var assert = require('assert');
var dust = require(__dirname + '/../../lib/hapi-dust');
require(__dirname + '/../mock/loader').models();
var dropper = require(__dirname + '/../mock/dropper');

describe('Teste do helper @news_article', function(){

  // Limpando o banco de dados antes e depois das operações
  before(dropper);
  after(dropper);

  it('Deve renderizar o formulário de nova noticia', function(cb){
    var template = '{@new_news}{newPost}{/new_news}';
    dust.compile(template, {}, function(err, compiled){
        assert.ifError(err);
        //context.stack.head.params
        compiled({}, {}, function(err, html){
          assert.ifError(err);
          assert.ok(html.indexOf('Nova postagem à vista!!') > -1);
          cb();
        });
      });
  });
});
