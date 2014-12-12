// Teste da lib do servidor http
var server = require(__dirname + '/../lib/http');
var assert = require('assert');

describe('Servidor HTTP', function(){
  it('O servidor HTTP deve exportar uma instância do hapi', function(){
    assert.equal(server.info.host, '0.0.0.0');
  });

  it('Deve ser capaz de iniciar um servidor na porta padrão', function(cb){
    server.start(function(err){
      assert.ifError(err);
      server.stop(function(err){
        assert.ifError(err);
        cb();
      });
    });
  });
});
