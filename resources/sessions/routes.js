const router = require('express').Router()

const handlers = require('./handlers')
const schemas = require('./schemas')
const validator = require('../../lib/validator')
const session = require('../../lib/session')
const asyncHandler = require('../../lib/async-handler')
const bodyParser = require('body-parser')

router.post('/sessions',
  session({ restrict: false }),
  bodyParser.json(),
  validator({ body: schemas.create }),
  asyncHandler(handlers.create))

router.get('/sessions',
  session(),
  handlers.findOne)

router.delete('/sessions',
  session(),
  handlers.remove)

module.exports = router
