'use strict'

const knex = require('knex')(require('./knexfile')[process.env.NODE_ENV])
const bookshelf = require('bookshelf')(knex)
const glob = require('glob')
const path = require('path')

// Registra todos os plugins necessários para o bookshelf
bookshelf.plugin('registry')
bookshelf.plugin('visibility')
bookshelf.plugin('virtuals')
bookshelf.plugin(require('bookshelf-uuid'))
bookshelf.plugin(require('bookshelf-modelbase').pluggable)
bookshelf.plugin(require('bookshelf-bcrypt'))
bookshelf.plugin(require('./base'))
bookshelf.plugin(require('./truncate'))

const modelsPath = path.resolve(__dirname, '../../resources')

// Faz o eager loading de todos os módulos
glob.sync(`${modelsPath}/**/model.js`)
.map(require)
.forEach(model => model(bookshelf))

module.exports = bookshelf
