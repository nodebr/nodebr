var XConf = require('xconf');
var config = new XConf();

// Carregando o arquivo principal
config.file(__dirname + '/../config/default.json');

// Carregar o arquivo de configuração do modo de produção
// se estivermos em produção
if(process.env.NODE_ENV === 'production')
  config.file(__dirname + '/../config/production.json');

// Carregar o arquivo de testing se for travis
if(process.env.TRAVIS)
  config.file(__dirname + '/../config/testing.json');

module.exports = config;
