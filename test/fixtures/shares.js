const uuid = require('uuid')
const { knex } = require('../../lib/db')

const firstUserId = '212dd279-129f-474a-beb2-a1cac605cf48';
const secondUserId = '6af458a8-df22-4da9-a726-89d14076e220';

/**
 * Insere N registros na tabela shares
 * @param {object} options options.firstUserQty e options.secondUserQty determinam quantos shares serao criados por usuario
 * @return {Promise} Uma promise que resolve quando os registros forem inseridos
 */
exports.insertMultiple = (options) => {
  const sharesFirstUser = []
  const sharesSecondUser = []

  for (let i = 0; i < options.firstUserQty; i++) {
    sharesFirstUser.push({
      id: uuid.v4(),
      user_id: firstUserId,
      title: `Veja como utilizar o V8 da melhor maneira - Parte ${i + 1}`,
      thumbnail: 'https://google.com.br/logo',
      link: 'https://google.com.br',
      created_at: new Date(),
      updated_at: new Date()
    })
  }

  for (let i = 0; i < options.secondUserQty; i++) {
    sharesSecondUser.push({
      id: uuid.v4(),
      user_id: secondUserId,
      title: `Introdução a NodeJS - Parte ${i + 1}`,
      thumbnail: 'https://google.com.br/logo',
      link: 'https://google.com.br',
      created_at: new Date(),
      updated_at: new Date()
    })
  }

  const totalShares = sharesFirstUser.concat(sharesSecondUser)

  return knex('shares').insert(totalShares)
}

/**
 * Insere N registros na tabela shares com IDs predeterminados
 * @param {array} uuidArray array de uuids para criar novos registros
 * @return {Promise} Uma promise que resolve quando os registros forem inseridos
 */
exports.insertMultipleWithId = uuidArray =>
  knex('shares').insert(uuidArray.map(id => ({
    id: id,
    user_id: firstUserId,
    title: `Artigo teste compartilhamento - Parte ${i + 1}`,
    thumbnail: 'https://google.com.br/logo',
    link: 'https://google.com.br',
    created_at: new Date(),
    updated_at: new Date()
  })))
