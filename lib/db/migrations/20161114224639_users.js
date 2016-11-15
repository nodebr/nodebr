exports.up = knex => knex.schema.createTableIfNotExists('users', table => {
  table.uuid('id').primary()
  table.string('username', 20).unique().notNullable()
  table.string('password', 60).notNullable()
  table.timestamps()
})

exports.down = knex => knex.schema.dropTableIfExists('users')
