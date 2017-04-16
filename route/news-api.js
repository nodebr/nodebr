// Rota responsável por cadastrar notícias
var News = require('mongoose').model('news');
var Joi = require('joi');
var server  = require(__dirname + '/../lib/http');

// Pegas as últimas notícias
server.route({
  method: 'GET',
  path: '/api/v1/news',
  handler: function(req, res){
    News.paginate({}, req.query.page, 20,
      function(err, pages, result, total){
        if(err)
          throw err;

        res({
          result : result,
          pages: pages,
          total: total
        });

      }, {
        sortBy: {
          created: -1
        }
      });
  },
  config: {
    validate: {
      query: {
        page: Joi.number().min(1).default(1)
      }
    }
  }
});

// Inserir uma notícia
server.route({
  method: 'POST',
  path: '/api/v1/news',
  handler: function(req, res){
    var news = new News(req.payload);
    news.save(function(err, doc){
      if(err)
        throw err;

      res(doc);
    });
  },
  config: {
    validate: {
      payload: {
        title: Joi.string().required().min(5).max(100),
        link: Joi.string().required().min(5).max(250),
        description: Joi.string().max(250).default(''),
        user: {
          name: Joi.string().min(2).max(100),
          email: Joi.string().email()
        }
      }
    }
  }
});


// Update Karma
server.route({
  method: 'PUT',
  path: '/api/v1/news/{slug}/karma',
  handler: function(req, res){
    var slug = encodeURIComponent(req.params.slug);
    News.findOneAndUpdate({'slug': slug}, {$inc: {karma: req.payload.karma}},
      function(err, data){
          if(err)
            throw err;

          res(data);
        });
  },
  config: {
    validate: {
      payload: {
        karma: Joi.any().allow([1, -1]).required()
      }
    }
  }
});
