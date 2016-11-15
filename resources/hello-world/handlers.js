'use strict'

const db = require('../../lib/db')
const HelloWorld = db.model('HelloWorld')

exports.findAll = (req, res) => {
  HelloWorld.findAll()
  .then(collection => res.send(collection))
}

exports.findOne = (req, res) => {
  HelloWorld.findById(req.params.id)
  .then(helloWorld => res.send(helloWorld))
}

exports.remove = (req, res) => {
  HelloWorld.forge({ id: req.params.id })
  .destroy()
  .then(() => res.send({ success: true }))
}

exports.create = (req, res) => {
  HelloWorld.create(req.body)
  .then(helloWorld => res.send(helloWorld))
}
