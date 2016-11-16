
exports.up = knex => knex.schema.createTableIfNotExists('shares', table => {
  table.uuid('id').primary()
  table.uuid('user_id').index().references('id').inTable('users')
  table.string('title', 120).notNullable()
  table.string('thumbnail', 255)
  table.string('link', 255).notNullable()
  table.timestamps()
});

exports.down = knex => knex.schema.dropTableIfExists('shares');
