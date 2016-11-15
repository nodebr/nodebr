const cookieSession = require('cookie-session')

/**
 * Um middleware para checagem de sessão
 * @param {Object} [config] Configurações da sessão
 * @param {Boolean} [config.restrict=true] Deixar que apenas usuários logados
 * acessem o handler
 * @return {Function} Uma função que serve de middleware
 */
module.exports = (config = {
  restrict: true
}) => {
  const session = cookieSession({
    name: 'session',
    keys: [process.env.COOKIE_SECRET],
    maxAge: 168 * 60 * 60 * 1000, //  Uma semana
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    signed: true,
    overwrite: true
  })

  return (req, res, next) => {
    // Checa a sessão utilizando o middleware cookie-session
    session(req, res, err => {
      if (err) {
        return next(err)
      }

      // Caso o acesso seja restrito à usuários logados precisamos verificar
      // se a sessão foi lida com sucesso
      if ((!req.session || !req.session.user_id) && config.restrict) {
        res.status(401).send({ error: 'Unauthorized' })
      } else {
        next()
      }
    })
  }
}
