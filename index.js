'use strict'

require('dotenv').config()

const server = require('./lib/server')

// Inicia o servidor na porta especificada pelo environment
server.listen(process.env.PORT, err => {
  if (err) throw err

  console.log(`Servidor iniciado na porta ${process.env.PORT}`)
})
