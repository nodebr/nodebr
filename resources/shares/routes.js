const express = require('express')
const bodyParser = require('body-parser')

const validator = require('../../lib/validator')
const schemas = require('./schemas')
const handlers = require('./handlers')
const router = express.Router()
const session = require('../../lib/session')

router.get('/compartilhamentos/',
  validator({ query: schemas.query }),
  handlers.findAll)

router.get('/compartilhamentos/:id', handlers.findOne)

router.post('/compartilhamentos',
  bodyParser.json(),
  validator({ body: schemas.create }),
  handlers.create)

router.delete('/compartilhamentos/:id',
  session(),
  handlers.remove)

module.exports = router
