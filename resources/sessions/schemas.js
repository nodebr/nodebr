const Joi = require('joi')

exports.create = Joi.object({
  username: Joi.string().token().min(3).max(20).required(),
  password: Joi.string().min(8).max(120).required()
})
