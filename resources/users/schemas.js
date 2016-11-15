const Joi = require('joi')

exports.model = Joi.object({
  id: Joi.string().uuid(),
  username: Joi.string(),
  password: Joi.string()
})

exports.create = exports.model.concat(Joi.object({
  id: Joi.forbidden(),
  username: Joi.string().alphanum().min(3).max(20).required(),
  password: Joi.string().max(60).required()
}))
