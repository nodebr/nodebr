const db = require('../../lib/db')
const User = db.model('User')

exports.create = (req, res, next) => {
  User.create(req.body)
  .then(user => res.send({ success: true }))
  .catch(err => {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).send({
        error: 'Este usuário já existe'
      })
    }

    return next(err)
  })
}
