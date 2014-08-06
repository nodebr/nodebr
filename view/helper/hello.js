module.exports = function(chunk, context, bodies, params){
  return chunk.write('Hello world!');
};
