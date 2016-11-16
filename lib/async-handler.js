const co = require('co')

/**
 * Um helper para registrar handlers assíncronos
 * @todo  Implementar funcionalidade para Promises
 * @param {Function} handler Um generator que irá receber a requisição
 * @return {Function} Uma função que pode ser usada como handler no Express
 */
module.exports = handler => (req, res, next) => {
  co(handler.bind(null, req, res, next))
  .catch(err => next(err))
}
