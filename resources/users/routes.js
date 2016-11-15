
const express = require('express')
const bodyParser = require('body-parser')

const validator = require('../../lib/validator')
const schemas = require('./schemas')
const handlers = require('./handlers')

const router = express.Router()

router.get('/users', handlers.findAll)
router.get('/users/:id', handlers.findOne)

router.post('/users',
  bodyParser.json(),
  validator({ body: schemas.create }),
  handlers.create)

module.exports = router
