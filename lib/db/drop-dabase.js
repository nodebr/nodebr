/* $lab:coverage:off$ */
const co = require('co')

/**
 * Cria uma função no Bookshelf para zerar o banco de dados
 * @param {Object} bookshelf Uma instância do Bookshelf
 */
module.exports = bookshelf => {
  const { knex } = bookshelf

  bookshelf.dropDatabase = co.wrap(function * () {
    // Desabilita este comando em qualquer outro ambiante que não seja desenvolvimento
    if (process.env.NODE_ENV === 'production') {
      return Promise.reject(new Error('Você não pode executar o dropDatabase neste ambiente'))
    }

    // Pega todas as tabelas no nosso banco de dados
    const result = yield knex.raw('SHOW TABLES;')
    const tables = result[0].map(table => table[Object.keys(table)[0]])

    yield knex.transaction(co.wrap(function * (trx) {
      yield knex.raw('SET FOREIGN_KEY_CHECKS = 0;')
      yield Promise.all(tables.map(table => knex.raw(`DROP TABLE ${table};`)))
      yield knex.raw('SET FOREIGN_KEY_CHECKS = 1;')
    }))
  })
}
/* $lab:coverage:on$ */
