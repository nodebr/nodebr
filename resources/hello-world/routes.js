'use strict'

const express = require('express')
const bodyParser = require('body-parser')

const validator = require('../../lib/validator')
const schemas = require('./schemas')
const handlers = require('./handlers')
const router = express.Router()

router.get('/hello-world', handlers.findAll)
router.get('/hello-world/:id', handlers.findOne)

router.post('/hello-world',
  bodyParser.json(),
  validator({ body: schemas.create }),
  handlers.create)

router.delete('/hello-world/:id', handlers.remove)

// Somente exportamos esta rota caso o ambiente for de desenvolvimento
// pois não queremos que a mesma esteja disponível em produção
/* $lab:coverage:off$ */
if (process.env.NODE_ENV !== 'production') {
  module.exports = router
}
/* $lab:coverage:on$ */
