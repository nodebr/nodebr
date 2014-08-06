// Testes da biblioteca de abstração do banco de dados
var db = require(__dirname + '/../lib/db');
var assert = require('assert');

describe('Biblioteca de abstração do banco de dados', function(){
  it('Deve emitir o evento ready', function(done){
    setTimeout(function(){
      db.on('ready', done);
    }, 1500);
  });

  it('Deve inserir documentos', function(done){
    db.collection('travis').insert({
      testing: true
    }, done);
  });

  it('Deve recuperar documentos', function(done){
    db.collection('travis').findOne({testing: true}, function(err, doc){
      assert.ifError(err);
      assert.ok(doc.testing);
      done();
    });
  });

  it('Deve criar IDs', function(){
    var id = new db.mongo.ObjectID();
    assert.equal(id.toString().length, 24);
  });

  it('Deve estar conectado', function(){
    assert.ok(db.connected);
  });

  it('Deve dropar a tabela Travis', function(done){
    db.collection('travis').drop(function(err){
      assert.ifError(err);
      done();
    });
  });

});
