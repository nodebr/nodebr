'use strict'

/**
 * O modelo base para todos os outros models do nosso sistema
 * @param {Object} bookshelf Uma instância do Bookshelf
 * @return {Object} A mesma instância do Bookshelf com as configurações
 * padrões para todos os models
 */
module.exports = bookshelf => {
  bookshelf.Model = bookshelf.Model.extend({ uuid: true })
}
