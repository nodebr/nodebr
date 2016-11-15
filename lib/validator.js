'use strict'

const Joi = require('joi')

/**
 * Um middleware para validar a request antes de chegar no handler
 * @param {Object} schemas Um objeto onde cada chave representa a chave da
 * requisição que deve ser validada
 * @return {Function} Uma função que pode ser utilizada como middleware
 */
module.exports = schemas => (req, res, next) => {
  // Uma sinaleira simples guardando o número de validações assíncronas que
  // resta fazer antes de chamar o callback
  let validations = Object.keys(schemas).length
  let nextWasCalled = false

  Object.keys(schemas).forEach(schema => {
    Joi.validate(req[schema], schemas[schema], (err, value) => {
      // Se houver um erro chame o callback com este erro, mas tenha certeza
      // que irá chamar apenas uma vez
      if (err && !nextWasCalled) {
        nextWasCalled = true
        return next(err)
      } else {
        // Faça o monkeypatch da requisição para evitar que campos não
        // validados continuem pela pileline do Express
        req[schema] = value

        // Diminui um elemento na sinaleira
        --validations

        // Se a sinaleira for 0 significa que todas as validações já voltaram
        // agora basta verificar se o next ainda não foi chamado (em caso de
        // erro) e passar para o próximo middleware
        if (validations === 0 && !nextWasCalled) {
          next()
        }
      }
    })
  })
}
