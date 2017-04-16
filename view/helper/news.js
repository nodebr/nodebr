var News = require(__dirname + '/../../model/news-model');

module.exports = function(chunk, context, bodies, params){
  return chunk.map(function(chunk){

    // Pegamos a página que foi passada
    // pelos parâmetros do plugin, se não existir
    // o default será 1
    var page = Number(params ? params.page : 1) || 1;

    // Paginamos com um limite de 20 indicando qual página
    // estamos no momento
    News.paginate({}, page, 20, function(err, pages, result, itens){
        if(err)
          throw err;

        // Calculamos a paginação para criar uma array e iterar mais tarde
        var pagination = new Array(pages).join(',').split(',')
          .map(function(a, i){
            return ++i;
          });


        // Renderizamos o bloco principal com as notícias e a paginação
        chunk.render(bodies.block, context.push({
          news : result,
          pagination: pagination,
          pages: pages,
          current: page,
          itens: itens
        }));

        // Avisamos para o dust.js que o nosso trabalho aqui terminou
        chunk.end();

      }, {sortBy: {created: -1}
    });
  });
};
