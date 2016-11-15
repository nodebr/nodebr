'use strict'

exports.up = knex => {
  // Apenas roda esta migration se estivermos em um ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    return knex.schema.createTableIfNotExists('hello_world', table => {
      table.uuid('id').primary()
      table.string('nome')
      table.string('sobrenome')
      table.string('email')
      table.timestamps()
    })
  } else {
    return Promise.resolve()
  }
}

exports.down = knex => {
  if (process.env.NODE_ENV !== 'production') {
    return knex.schema.dropTableIfExists('hello_world')
  } else {
    return Promise.resolve()
  }
}
