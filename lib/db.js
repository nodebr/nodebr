// Biblioteca responsável pela conexão com o banco de dados
var mongo = require('mongodb');
var config = require(__dirname + '/config');
var events = require('events');

var emitter = new events.EventEmitter();
var db = null;

// Devemos emitir o evento ready para quem escutar
// tarde de mais pelo primeiro evento disparado
emitter.on('newListener', function(e, cb){
  if(e === 'ready' && db)
    cb();
});

mongo.MongoClient.connect(config.get('mongodb'), function(err, conn){
  if(err)
    throw err;

  db = conn;
  emitter.emit('ready');
});

module.exports = Object.create(emitter, {
  collection: {
    enumerable: true,
    get: function(){
      if(!db)
        throw new Error('O banco de dados ainda não conectou.');

      return db.collection.bind(db);
    }
  },
  mongo: {
    enumerable: true,
    get: function(){
      return mongo;
    }
  },
  connected: {
    enumerable: true,
    get: function(){
      return !!db;
    }
  },
  connection: {
    enumerable: true,
    get: function(){
      if(!db)
        throw new Error('O banco de dados ainda não conectou.');

      return db;
    }
  }
});
