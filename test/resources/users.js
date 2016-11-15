const lab = exports.lab = require('lab').script()
const expect = require('code').expect
const co = require('co')
const request = require('supertest')

const server = require('../../lib/server')
const db = require('../../lib/db')
const Model = db.model('User')

const ENDPOINT = '/usuarios'

lab.describe('users', () => {
  lab.beforeEach(() => db.truncate())

  lab.describe(`POST ${ENDPOINT}`, () => {
    lab.test('não deve aceitar um payload que não esteja de acordo com o schema', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({ username: 'p' })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.error).to.equal('ValidationError')
    }))

    lab.test('deve criar uma nova linha no banco de dados', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'mark',
        password: 'awesomePass'
      })

      expect(req.statusCode).to.equal(200)
      expect(req.res.body.success).to.equal(true)

      const data = yield Model.findAll()
      expect(data).to.have.length(1)
      expect(data.at(0).toJSON()).to.contain({
        username: 'mark'
      })
    }))

    lab.test('retorna um erro quando o usuário já existir', co.wrap(function * () {
      // first request
      yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'foo',
        password: 'foobarbaz'
      })

      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'foo',
        password: 'foobarbaz'
      })

      expect(req.statusCode).to.equal(400)
      expect(req.res.body.error).to.equal('Este usuário já existe')

      const data = yield Model.findAll()
      expect(data).to.have.length(1)
      expect(data.at(0).toJSON()).to.contain({
        username: 'foo'
      })
    }))
  })
})

