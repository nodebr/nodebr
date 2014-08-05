var XConf = require('xconf');
var config = new XConf();

// Carregando o arquivo principal
config.file(__dirname + '/../config/default.json');

// Carregar o arquivo de configuração do modo de produção
// se estivermos em produção
if(process.env.NODE_ENV === 'production')
  config.file(__dirname + '/../config/production.json');

module.exports = config;
