// Testes da biblioteca de abstração do banco de dados
var db = require(__dirname + '/../lib/db');
var assert = require('assert');
var Model = db.model('model', {
  test: Boolean
});

describe('Biblioteca de abstração do banco de dados', function(){

  it('Deve inserir documentos', function(done){
    var model = new Model({test: true});
    model.save(done);
  });

  it('Deve recuperar documentos', function(done){
    Model.findOne({test: true}, function(err, doc){
      assert.ifError(err);
      assert.ok(doc.test);
      done();
    });
  });

  it('Deve dropar a tabela models', function(done){
    db.connection.collections.models.drop(done);
  });

});
