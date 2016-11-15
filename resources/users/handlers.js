
const db = require('../../lib/db')
const User = db.model('User')

exports.findAll = (req, res) => {
  User.findAll()
  .then(users => res.send(users))
}

exports.findOne = (req, res) => {
  User.findById(req.params.id)
  .then(user => res.send(user))
}

exports.remove = (req, res) => {
  User.forge({ id: req.params.id })
  .destroy()
  .then(() => res.send({ success: true }))
}

exports.create = (req, res) => {
  User.create(req.body)
  .then(user => res.send(user))
  .catch(err => {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).send({
        error: 'Este usuário já existe'
      })
    }

    // this might be useful while developing
    // but maybe bad in production, should ideally just log it
    // and return a fixed code to prevent sending sensitive info
    return res.status(400).send(err)
  })
}
