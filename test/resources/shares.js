const lab = exports.lab = require('lab').script()
const expect = require('code').expect
const co = require('co')
const request = require('supertest')
const uuid = require('uuid')

const server = require('../../lib/server')
const db = require('../../lib/db')
const Share = db.model('Share')
const fixtures = require('../fixtures')

const ENDPOINT = '/shares'
const firstUserId = '212dd279-129f-474a-beb2-a1cac605cf48'

lab.describe('shares', () => {
  lab.beforeEach(() => db.truncate())

  lab.describe(`POST ${ENDPOINT}`, () => {
    lab.test('não deve aceitar um payload que não esteja de acordo com o schema', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        user_id: firstUserId,
        title: 'a',
        thumbnail: 1,
        link: 2
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.error).to.equal('ValidationError')
    }))

    lab.test('deve criar uma nova linha no banco de dados', co.wrap(function * () {
      const title = 'Lab test article'
      const thumbnail = 'http://placehold.it/350x150'
      const link = 'https://www.google.com/'
      const req = yield request(server)
      .post(ENDPOINT)
      .send({ user_id: firstUserId, title, thumbnail, link })

      expect(req.statusCode).to.equal(200)
      expect(req.res.body.user_id).to.equal(firstUserId)
      expect(req.res.body.title).to.equal(title)
      expect(req.res.body.thumbnail).to.equal(thumbnail)
      expect(req.res.body.link).to.equal(link)

      const data = yield Share.findAll()
      expect(data).to.have.length(1)
      expect(data.at(0).toJSON()).to.contain({
        id: req.res.body.id,
        user_id: firstUserId,
        title,
        thumbnail,
        link
      })
    }))
  })

  lab.describe(`GET ${ENDPOINT}`, () => {
    lab.test('deve retornar até as 50 primeiras linhas do banco de dados', co.wrap(function * () {
      const options = { firstUserSharesQty: 15, secondUserSharesQty: 1 }
      yield fixtures.shares.insertMultiple(options)

      const req = yield request(server)
      .get(ENDPOINT)

      const titles = []
      for (var i = 0; i < 15; i++) {
        titles.push(`Veja como utilizar o V8 da melhor maneira - Parte ${i + 1}`)
      }

      titles.push('Introdução a NodeJS - Parte 1')

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.array()
      expect(req.res.body).to.have.length(16)
      expect(req.res.body.map(item => item.title)).to.contain(titles)
    }))

    lab.test('deve retornar até as 5 primeiras linhas do banco de dados', co.wrap(function * () {
      const options = { firstUserSharesQty: 4, secondUserSharesQty: 2 }
      yield fixtures.shares.insertMultiple(options)

      const baseTitle = 'Veja como utilizar o V8 da melhor maneira - Parte '
      const req = yield request(server)
      .get(`${ENDPOINT}?limit=5&page=1`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.array()
      expect(req.res.body).to.have.length(5)
      expect(req.res.body.map(item => item.title)).to.contain([
        baseTitle + '1',
        baseTitle + '2',
        baseTitle + '3',
        baseTitle + '4',
        'Introdução a NodeJS - Parte 1'
      ])
    }))

    lab.test('deve pular as 5 primeiras linhas do banco de dados e retornar a seguinte', co.wrap(function * () {
      const options = { firstUserSharesQty: 4, secondUserSharesQty: 2 }
      yield fixtures.shares.insertMultiple(options)

      const req = yield request(server)
      .get(`${ENDPOINT}?limit=5&page=2`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.array()
      expect(req.res.body).to.have.length(1)
      expect(req.res.body.map(item => item.title)).to.contain([
        'Introdução a NodeJS - Parte 2'
      ])
    }))
  })

  lab.describe(`GET ${ENDPOINT}/:id`, () => {
    lab.test('deve retornar a linha selecionada', co.wrap(function * () {
      const id = uuid.v4()

      yield fixtures.shares.insertMultipleWithId([id])

      const req = yield request(server)
      .get(`${ENDPOINT}/${id}`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.contain({
        id: id,
        user_id: firstUserId,
        title: `Veja como utilizar o V8 da melhor maneira - Parte 1`,
        thumbnail: 'https://google.com.br/logo',
        link: 'https://google.com.br'
      })
    }))

    lab.test('não deve encontrar linhas', co.wrap(function * () {
      const id = uuid.v4()
      const otherId = uuid.v4()

      yield fixtures.shares.insertMultipleWithId([id])

      const req = yield request(server)
      .get(`${ENDPOINT}/${otherId}`)

      expect(req.statusCode).to.equal(404)
    }))
  })

  lab.describe(`DELETE ${ENDPOINT}/:id`, () => {
    lab.test('deve remover do banco de dados a linha selecionada', co.wrap(function * () {
      const id = uuid.v4()

      yield fixtures.shares.insertMultipleWithId([id])
      yield fixtures.users.insertMultiple()

      const req = yield request(server)
      .set('Cookie', yield fixtures.sessions.cookie('alanhoff', 'awesomePassword'))
      .delete(`${ENDPOINT}/${id}`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.equal({ success: true })

      const data = yield Share
      .findOne(id, { require: false })

      expect(data).to.not.exist()
    }))

    lab.test('não deve remover do banco de dados a linha selecionada para outro usuário', co.wrap(function * () {
      const id = uuid.v4()

      yield fixtures.shares.insertMultipleWithId([id])

      const req = yield request(server)
      .set('Cookie', yield fixtures.sessions.cookie('thebergamo', 'awesomePassword'))
      .delete(`${ENDPOINT}/${id}`)

      expect(req.statusCode).to.equal(403)
    }))
  })
})
