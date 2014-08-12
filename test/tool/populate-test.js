// Testando a ferramenta de populate
var child = require('child_process');
var loader = require(__dirname + '/../mock/loader');
var assert = require('assert');
var dropper = require(__dirname + '/../mock/dropper');

loader.models();

describe('Ferramente de população de banco de dados', function(){

  before(dropper);
  after(dropper);

  it('Deve iniciar e sair sem problemas', function(done){
    child.fork(__dirname + '/../../tool/populate.js', {
        silent: true
      })
      .on('exit', function(code){
        assert.equal(code, 0);
        done();
      })
      .on('error', function(err){
        assert.ifError(err);
      });
  });

  it('Deve ter inserido 50 notícias', function(done){
    var News = require(__dirname + '/../../model/news-model');
    News.count({}, function(err, count){
      assert.ifError(err);
      assert.equal(count, 50);
      done();
    });
  });

});
