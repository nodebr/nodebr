'use strict'

const Joi = require('joi')

exports.model = Joi.object({
  id: Joi.string().uuid(),
  nome: Joi.string(),
  sobrenome: Joi.string(),
  email: Joi.string().email()
})

exports.create = exports.model.concat(Joi.object({
  id: Joi.forbidden(),
  nome: Joi.required(),
  sobrenome: Joi.required(),
  email: Joi.required()
}))
