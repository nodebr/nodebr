'use strict'

/**
 * Cria uma função no Bookshelf para zerar o banco de dados
 * @param {Object} bookshelf Uma instância do Bookshelf
 */
module.exports = bookshelf => {
  const { knex } = bookshelf

  bookshelf.truncate = () => {
    // Desabilita este comando em qualquer outro ambiante que não seja desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return Promise.reject(new Error('Você não pode executar o truncate neste ambiente'))
    }

    // Constrói
    const commands = Object.keys(bookshelf._models)
    .map(key => bookshelf._models[key].prototype.tableName)
    .map(tableName => `TRUNCATE TABLE ${tableName};`)

    return knex.transaction(trx => {
      return trx.raw('SET FOREIGN_KEY_CHECKS = 0;')
      .then(() => Promise.all(commands.map(command => trx.raw(command))))
      .then(() => trx.raw('SET FOREIGN_KEY_CHECKS = 1;'))
    })
  }
}
