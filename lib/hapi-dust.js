// Lib responsável por renderizar .dust templates,
// Usado pelo Hapi
// TODO: isso poderia virar um módulo no npm
var dust = require('dustjs-linkedin');
var helpers = require('dustjs-helpers');

module.exports = {
  compile: function(template, options, cb){
    var compiled = dust.compileFn(template);
    cb(null, function(context, options, cb){
      console.log('arguments');
      compiled(context, cb);
    });
  },
  compileMode: 'async'
};
