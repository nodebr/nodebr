const lab = exports.lab = require('lab').script()
const expect = require('code').expect
const co = require('co')
const request = require('supertest')

const server = require('../../lib/server')
const db = require('../../lib/db')
const fixtures = require('../fixtures')

const ENDPOINT = '/sessions'

lab.describe('sessions', () => {
  lab.beforeEach(() => db.truncate())

  lab.describe(`POST ${ENDPOINT}`, () => {
    lab.test('deve criar uma sessão', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'alanhoff',
        password: 'password'
      })

      expect(req.statusCode).to.equal(200)
      expect(req.headers['set-cookie']).to.have.length(2)
    }))

    lab.test('deve validar os dados', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'alanhoff',
        password: '123'
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.error).to.equal('ValidationError')
    }))

    lab.test('Não deve aceitar usuários logados', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .post(ENDPOINT)
      .set('Cookie', yield fixtures.sessions.cookie('alanhoff', 'password'))
      .send({
        username: 'alanhoff',
        password: 'password'
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.message).to.equal('Você já está logado')
    }))

    lab.test('Não deve aceitar usuários que não existem', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'alanhoff2',
        password: 'password'
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.message).to.equal('Não foi possível encontrar o usuário')
    }))

    lab.test('Não deve aceitar senhas inválidas', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        username: 'alanhoff',
        password: 'invalid_pwd'
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.message).to.equal('Sua senha está incorreta')
    }))
  })

  lab.describe(`GET ${ENDPOINT}`, () => {
    lab.test('deve retornar a sessão', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .get(ENDPOINT)
      .set('Cookie', yield fixtures.sessions.cookie('alanhoff', 'password'))

      expect(req.statusCode).to.equal(200)
      expect(req.res.body.password).to.not.exist()
      expect(req.res.body).to.contain({
        username: 'alanhoff',
        id: '212dd279-129f-474a-beb2-a1cac605cf48'
      })
    }))

    lab.test('não deve retornar a sessão para usuários não autenticados', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .get(ENDPOINT)

      expect(req.statusCode).to.equal(401)
      expect(req.res.body.error).to.equal('Unauthorized')
    }))
  })

  lab.describe(`DELETE ${ENDPOINT}`, () => {
    lab.test('deve remover a sessão sessão', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .delete(ENDPOINT)
      .set('Cookie', yield fixtures.sessions.cookie('alanhoff', 'password'))

      expect(req.headers['set-cookie'][0].split(';')[0]).to.equal('session=')
    }))

    lab.test('não deve remover a sessão de usuários não autenticados', co.wrap(function * () {
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .delete(ENDPOINT)

      expect(req.statusCode).to.equal(401)
      expect(req.res.body.error).to.equal('Unauthorized')
    }))
  })
})

