'use strict'

/**
 * Um middleware para captura de erros
 * @param {Error} err O erro gerado em um middleware anterior
 * @param {Object} req Uma interface de requisição do Express
 * @param {Object} res Uma interface de resposta do Express
 * @param {Function} next Um callback caso necessário
 */
module.exports = (err, req, res, next) => {
  // Verifica se já não houve a resposta
  if (res.headersSent) {
    return next(err)
  }

  // Verifica os tipos de erros que podemos ter
  if (err.isJoi) {
    res.status(422).send({
      error: 'ValidationError',
      message: err.details[0].message,
      path: err.details[0].path,
      type: err.details[0].type
    })
  } else {
    // Caso nenhum tipo de erro seja encontrado então é um erro no servidor
    res.status(500).send({ error: 'InternalServerError' })
    console.error(err.stack)
  }
}
