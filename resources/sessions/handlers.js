const Boom = require('boom')

const db = require('../../lib/db')
const User = db.model('User')

exports.create = function * (req, res) {
  // Verifica se o usuário já está logado
  if (req.session && req.session.user_id) {
    throw Boom.badData('Você já está logado')
  }

  // Pega no banco de dados o usuário que precisamos
  const user = yield User.findOne({ username: req.body.username })
  .catch(User.NotFoundError, () => {
    throw Boom.badData('Não foi possível encontrar o usuário')
  })

  // Verifica se a senha está ok
  if (!(yield user.compare(req.body.password))) {
    throw Boom.badData('Sua senha está incorreta')
  }

  // Seta a sessão e retorna sucesso
  req.session.user_id = user.id
  res.send({ success: true })
}

exports.findOne = (req, res) => {
  User.findById(req.session.user_id)
  .then((user) => res.send(user))
}

exports.remove = (req, res) => {
  req.session = null
  res.send({ success: true })
}
