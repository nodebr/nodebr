const express = require('express');
const bodyParser = require('body-parser');

const validator = require('../../lib/validator');
const schemas = require('./schemas');
const handlers = require('./handlers');
const router = express.Router();

router.get('/compartilhamentos/',
  validator({ query: schemas.findLimitedByPageQs }),
  handlers.findLimitedByPage);

router.get('/compartilhamentos/:id', handlers.findOne);

router.post('/compartilhamentos',
  bodyParser.json(),
  validator({ body: schemas.create }),
  handlers.create);

router.delete('/compartilhamentos/:id', handlers.remove);

// Somente exportamos esta rota caso o ambiente for de desenvolvimento
// pois não queremos que a mesma esteja disponível em produção
if (process.env.NODE_ENV !== 'production') {
  module.exports = router;
}
