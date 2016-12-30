const Joi = require('joi')

exports.model = Joi.object({
  id: Joi.string().uuid(),
  user_id: Joi.string().uuid(),
  title: Joi.string(),
  thumbnail: Joi.string(),
  link: Joi.string()
})

exports.create = exports.model.concat(Joi.object({
  id: Joi.forbidden(),
  user_id: Joi.string().uuid(),
  title: Joi.string().min(10).max(120).required(),
  thumbnail: Joi.string().uri().max(255).optional(),
  link: Joi.string().uri().max(255).required()
}))

exports.query = Joi.object({
  limit: Joi.number().integer().positive().max(50).default(15),
  offset: Joi.number().integer().greater(-1).default(0)
})
