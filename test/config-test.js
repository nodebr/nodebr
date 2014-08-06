// Teste da lib de configuração
var config = require(__dirname + '/../lib/config');
var assert = require('assert');

describe('Lib de configuração', function(){

  it('A lib de configuração deve ser uma instância do XConf', function(){
    assert.equal(typeof config.get, 'function');
    assert.equal(typeof config.set, 'function');
  });

  it('Deve ser capaz de carregar as configurações padrões', function(){
    assert.equal(config.get('port'), 8080);
  });

});
