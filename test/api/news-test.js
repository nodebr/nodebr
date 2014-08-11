// Teste padrão das rotas
var assert = require('assert');
var server = require(__dirname + '/../../lib/http');
var loader = require(__dirname + '/../mock/loader');
var dropper = require(__dirname + '/../mock/dropper');
var request = require('supertest');

loader.routes();
loader.models();

describe('Rota /api/v1/news', function(){
  // Limpando o banco de dados antes e depois dos testes
  console.log('AQUI', dropper);
  before(dropper);
  after(dropper);

  it('POST de notícias deve aceitar um documento bem formatado', function(cb){
    var data = {
      title : 'Testing news',
      link : 'http://nodebr.org',
      description: 'This is a testing news for testing purposes.',
      user: {
        name: 'Travis CI',
        email: 'support@travis-ci.com'
      }
    };

    request(server.listener)
      .post('/api/v1/news')
      .set('Content-Type', 'application/json')
      .send(data)
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err){
        assert.ifError(err);
        cb();
      });
  });

  it('GET de notícias deve retornar as notícias', function(cb){
    request(server.listener)
      .get('/api/v1/news')
      .expect(200)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err, res){
        assert.ifError(err);
        assert.ok(res.body.result.length === 1);
        cb();
      });
  });

});
