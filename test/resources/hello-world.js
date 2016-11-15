'use strict'

const lab = exports.lab = require('lab').script()
const expect = require('code').expect
const co = require('co')
const request = require('supertest')

const server = require('../../lib/server')
const db = require('../../lib/db')
const HelloWorld = db.model('HelloWorld')
const fixtures = require('../fixtures')

const ENDPOINT = '/hello-world'

lab.describe('hello-world', () => {
  lab.beforeEach(() => db.knex('hello_world').truncate())

  lab.describe(`POST ${ENDPOINT}`, () => {
    lab.test('não deve aceitar um payload que não esteja de acordo com o schema', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({ hello: 'World' })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.error).to.equal('ValidationError')
    }))

    lab.test('deve criar uma nova linha no banco de dados', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        nome: 'Alan',
        sobrenome: 'Hoffmeister',
        email: 'alanhoffmeister@gmail.com'
      })

      expect(req.statusCode).to.equal(200)
      expect(req.res.body.nome).to.equal('Alan')
      expect(req.res.body.sobrenome).to.equal('Hoffmeister')
      expect(req.res.body.email).to.equal('alanhoffmeister@gmail.com')

      const data = yield HelloWorld.findAll()
      expect(data).to.have.length(1)
      expect(data.at(0).toJSON()).to.contain({
        id: req.res.body.id,
        nome: 'Alan',
        sobrenome: 'Hoffmeister',
        email: 'alanhoffmeister@gmail.com'
      })
    }))
  })

  lab.describe(`GET ${ENDPOINT}`, () => {
    lab.test('deve retornar todas as linhas do banco de dados', co.wrap(function * () {
      yield fixtures['hello-world'].insertMultiple()

      const req = yield request(server)
      .get(ENDPOINT)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.array()
      expect(req.res.body).to.have.length(2)
      expect(req.res.body.map(item => item.id)).to.contain([
        'ae5c4ed1-916b-4193-bb1c-2f278a4e0243',
        '4eb8065f-4483-4877-bfb5-147eb8d2766c'
      ])
    }))
  })

  lab.describe(`GET ${ENDPOINT}/:id`, () => {
    lab.test('deve retornar a linha selecionada', co.wrap(function * () {
      yield fixtures['hello-world'].insertMultiple()

      const req = yield request(server)
      .get(`${ENDPOINT}/ae5c4ed1-916b-4193-bb1c-2f278a4e0243`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.contain({
        id: 'ae5c4ed1-916b-4193-bb1c-2f278a4e0243',
        nome: 'João',
        sobrenome: 'Ninguém',
        email: 'joao_ninguem@gmail.com'
      })
    }))
  })

  lab.describe(`DELETE ${ENDPOINT}/:id`, () => {
    lab.test('deve remover do banco de dados a linha selecionada', co.wrap(function * () {
      yield fixtures['hello-world'].insertMultiple()

      const req = yield request(server)
      .delete(`${ENDPOINT}/ae5c4ed1-916b-4193-bb1c-2f278a4e0243`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.equal({ success: true })

      const data = yield HelloWorld.findById('ae5c4ed1-916b-4193-bb1c-2f278a4e0243', {
        require: false
      })

      expect(data).to.not.exist()
    }))
  })
})
