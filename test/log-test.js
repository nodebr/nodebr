// Teste da lib do servidor http
var log = require(__dirname + '/../lib/log');
var assert = require('assert');

describe('Bilblioteca de log', function(){
  it('O log deve ser uma instância do Winston', function(){
    assert.deepEqual([typeof log.warn, typeof log.info, typeof log.error],
      ['function', 'function', 'function']);
  });
});
