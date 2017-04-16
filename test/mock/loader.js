var requi = require('requi');
var config = require(__dirname + '/../../lib/config');

exports.routes = function(){
  requi(__dirname + '/../../route');
};

exports.models = function(){
  var db = require(__dirname + '/../../lib/db');
  if(!db.connection.readyState)
    db.connect(config.get('mongodb'));

  return requi(__dirname + '/../../model');
};
