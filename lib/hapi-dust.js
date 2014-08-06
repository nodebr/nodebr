// Lib responsável por renderizar .dust templates,
// Usado pelo Hapi
// TODO: isso poderia virar um módulo no npm
var dust = require('dustjs-helpers');
var requi = require('requi');
var customHelpers = requi(__dirname + '/../view/helper');
var fs = require('fs');
Object.keys(customHelpers).forEach(function(key){
  dust.helpers[key] = customHelpers[key];
});

dust.onLoad = function(name, cb){
  fs.readFile(__dirname + '/../view/' + name + '.dust', {
    encoding: 'utf8'
  }, cb);
};

module.exports = {
  compile: function(template, options, cb){
    var compiled = dust.compileFn(template);

    cb(null, function(context, options, cb){
      compiled(context, cb);
    });
  }
};
