
const express = require('express')
const bodyParser = require('body-parser')

const validator = require('../../lib/validator')
const schemas = require('./schemas')
const handlers = require('./handlers')

const router = express.Router()

router.post('/usuarios',
  bodyParser.json(),
  validator({ body: schemas.create }),
  handlers.create)

module.exports = router
