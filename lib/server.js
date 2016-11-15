'use strict'

const express = require('express')
const glob = require('glob')
const path = require('path')
const helmet = require('helmet')

// Middlewares customizados
const errorHandler = require('./error-handler')

// Injeta cada rota na nossa app
const app = express()

// Adiciona todos os middlewares necessários
app.use(helmet())

// Faz o require de todas as rotas dentro dos resources e injeta automaticamente
// na nossa app, assim não é necessário fazer o require um por um
const resourcePath = path.resolve(__dirname, '../resources')

glob.sync(`${resourcePath}/**/routes.js`)
.map(require)
.forEach(route => route && app.use(route))

// O gerenciador de erros deve vir por último
app.use(errorHandler)

// Bootstrapping finalizado, agora é seguro exportar a instância da nossa app
module.exports = app
