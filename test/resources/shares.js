const lab = exports.lab = require('lab').script()
const expect = require('code').expect
const co = require('co')
const request = require('supertest')

const server = require('../../lib/server')
const db = require('../../lib/db')
const Share = db.model('Share')
const fixtures = require('../fixtures')

const ENDPOINT = '/shares'

lab.describe('shares', () => {
  lab.beforeEach(() => db.truncate())

  lab.describe(`POST ${ENDPOINT}`, () => {
    lab.test('não deve aceitar um payload que não esteja de acordo com o schema', co.wrap(function * () {
      const req = yield request(server)
      .post(ENDPOINT)
      .send({
        user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
        title: 'a',
        thumbnail: 1,
        link: 2
      })

      expect(req.statusCode).to.equal(422)
      expect(req.res.body.error).to.equal('ValidationError')
    }))

    lab.test('deve criar uma nova linha no banco de dados', co.wrap(function * () {
      const req = yield request(server)
        .post(ENDPOINT)
        .send({
          user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
          title: 'Lab test article',
          thumbnail: 'http://placehold.it/350x150',
          link: 'https://www.google.com/'
        })

      expect(req.statusCode).to.equal(200)
      expect(req.res.body.user_id).to.equal('4eb8065f-4483-4877-bfb5-147eb8d2766c')
      expect(req.res.body.title).to.equal('Lab test article')
      expect(req.res.body.thumbnail).to.equal('http://placehold.it/350x150')
      expect(req.res.body.link).to.equal('https://www.google.com/')

      const data = yield Share.findAll()
      expect(data).to.have.length(1)
      expect(data.at(0).toJSON()).to.contain({
        id: req.res.body.id,
        user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
        title: 'Lab test article',
        thumbnail: 'http://placehold.it/350x150',
        link: 'https://www.google.com/'
      })
    }))
  })

  lab.describe(`GET ${ENDPOINT}`, () => {
    lab.test('deve retornar até as 50 primeiras linhas do banco de dados', co.wrap(function * () {
      const options = { firstUserSharesQty: 15, secondUserSharesQty: 1 }
      yield fixtures['shares'].insertMultiple(options)

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
  })

  lab.describe(`GET ${ENDPOINT}?limit=5&page=1`, () => {
    lab.test('deve retornar até as 5 primeiras linhas do banco de dados', co.wrap(function * () {
      const options = { firstUserSharesQty: 4, secondUserSharesQty: 2 }
      yield fixtures['shares'].insertMultiple(options)

      const req = yield request(server)
        .get(`${ENDPOINT}?limit=5&page=1`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.array()
      expect(req.res.body).to.have.length(5)
      expect(req.res.body.map(item => item.title)).to.contain([
        'Veja como utilizar o V8 da melhor maneira - Parte 1',
        'Veja como utilizar o V8 da melhor maneira - Parte 2',
        'Veja como utilizar o V8 da melhor maneira - Parte 3',
        'Veja como utilizar o V8 da melhor maneira - Parte 4',
        'Introdução a NodeJS - Parte 1'
      ])
    }))
  })

  lab.describe(`GET ${ENDPOINT}?limit=5&page=2`, () => {
    lab.test('deve pular as 5 primeiras linhas do banco de dados e retornar a seguinte', co.wrap(function * () {
      const options = { firstUserSharesQty: 4, secondUserSharesQty: 2 }
      yield fixtures['shares'].insertMultiple(options)

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
      const options = { firstUserSharesQty: 1, secondUserSharesQty: 0 }
      yield fixtures['shares'].insertMultiple(options)

      const req = yield request(server)
        .get(`${ENDPOINT}/shareUuid`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.contain({
        id: '',
        user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
        title: `Veja como utilizar o V8 da melhor maneira - Parte 1`,
        thumbnail: 'https://google.com.br/logo',
        link: 'https://google.com.br'
      })
    }))
  })

  lab.describe(`DELETE ${ENDPOINT}/:id`, () => {
    lab.test('deve remover do banco de dados a linha selecionada', co.wrap(function * () {
      const options = { firstUserSharesQty: 1, secondUserSharesQty: 0 }
      yield fixtures['shares'].insertMultiple(options)

      const req = yield request(server)
        .delete(`${ENDPOINT}/shareUuid`)

      expect(req.statusCode).to.equal(200)
      expect(req.res.body).to.be.an.object()
      expect(req.res.body).to.equal({ success: true })

      const data = yield Share
        .findOne('shareUuid', { require: false })

      expect(data).to.not.exist()
    }))
  })
})
