var News = require(__dirname + '/../../model/news-model');

module.exports = function(chunk, context, bodies){
  return chunk.map(function(chunk){

    // Verificamos o slug dá página para buscar a noticia
    var param = context.stack.head.params;
    var slug = param.slug;
    console.log('mark');

    // Fazemos a busca na Collection news em busca da noticia.
    // a noticia para ser válida tem que ter karma 0.
    News.findOne({'slug': slug}).where('karma').gt(-1).exec(function(err, not){
      if(err)
        throw err;

      console.log(not);

      // Renderizamos o a noticia.
      chunk.render(bodies.block, context.push({
        news : not,
      }));

      // Avisamos para o dust.js que o nosso trabalho aqui terminou
      chunk.end();
    });
  });
};
