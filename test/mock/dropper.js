// Exports uma função que ajuda a dropar
// o banco de dados para os testes

require(__dirname + '/loader').models();
var mongoose = require('mongoose');

var drop = function(cb){
  mongoose.connection.db.dropDatabase(cb);
};

module.exports = function(cb){
  if(mongoose.connection.readyState !== 1)
    mongoose.connection.on('connected', function(){
      drop(cb);
    });
  else
    drop(cb);
};
