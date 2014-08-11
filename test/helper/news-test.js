// Testar o helper que renderiza as notícias
var assert = require('assert');
var dust = require(__dirname + '/../../lib/hapi-dust');
require(__dirname + '/../mock/loader').models();
var mongoose = require('mongoose');
var News = mongoose.model('news');

describe('Teste do helper @news', function(){

  // Limpando o banco de dados antes e depois das operações
  before(function(cb){
    mongoose.connection.db.dropDatabase(cb);
  });

  after(function(cb){
    mongoose.connection.db.dropDatabase(cb);
  });

  // Criando uma notítica para ser testada
  before(function(cb){
    var news = new News({
      title : 'Testing news',
      link : 'http://nodebr.org',
      description: 'This is a testing news for testing purposes.',
      user: {
        name: 'Travis CI',
        email: 'support@travis-ci.com'
      }
    });

    news.save(cb);
  });

  it('Deve renderizar as notícias', function(cb){
    var template = '{@news}{#news}{title}{/news}{/news}';
    dust.compile(template, {}, function(err, compiled){
      assert.ifError(err);
      compiled({}, {}, function(err, html){
        assert.ifError(err);
        assert.ok(html.indexOf('Testing news') > -1);
        cb();
      });
    });
  });
});
