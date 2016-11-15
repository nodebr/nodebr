'use strict'

const fs = require('fs')
const path = require('path')

// Faz o require de todas as fixtures do projeto, assim não precisamos fazer
// o require de cada arquivo individualmente
module.exports = fs.readdirSync(__dirname)
.filter(file => file !== 'index.js')
.reduce((prev, curr) => {
  const key = curr.replace(/\.js$/i, '')
  prev[key] = require(path.resolve(__dirname, curr))

  return prev
}, {})
