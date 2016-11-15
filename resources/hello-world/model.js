'use strict'

/**
 * Cria o modelo HelloWorld
 * @param {Function} bookshelf Uma instância do Bookshelf
 */
module.exports = bookshelf => bookshelf.model('HelloWorld', {
  tableName: 'hello_world'
})
