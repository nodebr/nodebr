const server = require('../../lib/server')
const request = require('supertest')

/**
 * Cria um cookie compatível com a header Cookie para ser usado com o supertest
 * @param {String} username O nome do usuário
 * @param {String} password A senha do usuário
 * @return {Promise} Uma promise que resolve com o cookie de autenticação
 */
exports.cookie = (username, password) => request(server)
.post('/sessions')
.send({ username, password })
.then(res => res.header['set-cookie']
  .map(e => e.split(';')[0])
  .join(';'))
