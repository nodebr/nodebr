'use strict'

const { knex } = require('../../lib/db')

/**
 * Insere dois registros na tabela hello_world
 * @return {Promise} Uma promise que resolve quando os registros forem inseridos
 */
exports.insertMultiple = () => {
  return knex('hello_world').insert([
    {
      id: 'ae5c4ed1-916b-4193-bb1c-2f278a4e0243',
      nome: 'João',
      sobrenome: 'Ninguém',
      email: 'joao_ninguem@gmail.com',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
      nome: 'Alan',
      sobrenome: 'Hoffmeister',
      email: 'alanhoffmeister@gmail.com',
      created_at: new Date(),
      updated_at: new Date()
    }
  ])
}
