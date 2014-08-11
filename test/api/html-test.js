// Teste padrão das rotas
var assert = require('assert');
var server = require(__dirname + '/../../lib/http');
var loader = require(__dirname + '/../mock/loader');
var request = require('supertest');

loader.routes();

describe('Rota /', function(){
  it('Rota principal deve estar acessível e ser do tipo HTML', function(cb){
    request(server.listener)
      .get('/')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err){
        assert.ifError(err);
        cb();
      });
  });
});

describe('Rota /public', function(){
  it('A rota de arquivos estáticos não deve fazer listagem', function(cb){
    request(server.listener)
      .get('/public')
      .expect(403)
      .expect('Content-Type', 'application/json; charset=utf-8')
      .end(function(err){
        assert.ifError(err);
        cb();
      });
  });
});

describe('Rota /public/{file*}', function(){
  it('A rota de arquivos estáticos deve permitir arquivos', function(cb){
    request(server.listener)
      .get('/public/img/nodebr.png')
      .expect(200)
      .expect('Content-Type', 'image/png')
      .end(function(err){
        assert.ifError(err);
        cb();
      });
  });
});

describe('Rota /noticias', function(){
  it('Rota de notícias deve estar funcionando', function(cb){
    request(server.listener)
      .get('/noticias')
      .expect(200)
      .expect('Content-Type', 'text/html; charset=utf-8')
      .end(function(err){
        assert.ifError(err);
        cb();
      });
  });
});
