const { knex } = require('../../lib/db')

/**
 * Insere dois registros na tabela `users`
 * @return {Promise} Uma promise que resolve quando os registros forem inseridos
 */
exports.insertMultiple = () => knex('users').insert([
  {
    id: '212dd279-129f-474a-beb2-a1cac605cf48',
    username: 'alanhoff',
    password: 'awesomePassword',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '6af458a8-df22-4da9-a726-89d14076e220',
    username: 'thebergamo',
    password: 'awesomePassword',
    created_at: new Date(),
    updated_at: new Date()
  }
])
