// Biblioteca responsável pela conexão no banco de dados
var mongoose = require('mongoose');
var config = require(__dirname + '/config');
mongoose.connect(config.get('mongodb'));

module.exports = mongoose;
