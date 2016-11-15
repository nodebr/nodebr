
exports.up = knex => {
  // Apenas roda esta migration se estivermos em um ambiente de desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    return knex.schema.createTableIfNotExists('users', table => {
      table.uuid('id').primary()
      table.string('username', 20).unique().notNullable()
      table.string('password', 60).notNullable()
      table.timestamps()
    })
  } else {
    return Promise.resolve()
  }
}

exports.down = knex => {
  if (process.env.NODE_ENV !== 'production') {
    return knex.schema.dropTableIfExists('users')
  } else {
    return Promise.resolve()
  }
}
