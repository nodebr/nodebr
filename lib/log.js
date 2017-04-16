// Biblioteca responsável por controlar os logs
var winston = require('winston');
var config = require(__dirname + '/config');

winston.remove(winston.transports.Console);

if(config.get('log'))
  winston.add(winston.transports.Console, {
    timestamp: true
  });

module.exports = winston;
