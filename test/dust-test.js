// Lib responsável por renderizar os templates
var dust = require(__dirname + '/../lib/hapi-dust');
var assert = require('assert');

describe('Biblioteca de renderização de templates', function(){
  it('Deve exportar uma chave compile', function(){
    assert.ok(dust.compile);
  });

  it('Deve ser capaz de compilar', function(done){
    dust.compile('<h1>{hello}</h1>', {}, function(err, compile){
      assert.ifError(err);
      compile({hello : 'hello world'}, {}, function(err, html){
        assert.ifError(err);
        assert.equal(html, '<h1>hello world</h1>');
        done();
      });
    });
  });
});
