const { knex } = require('../../lib/db');

function s4() {
  return Math
    .floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

/**
 * Insere N registros na tabela shares
 * @return {Promise} Uma promise que resolve quando os registros forem inseridos
 */
exports.insertMultiple = (firstUserQty, secondUserQty) => {
  const sharesFirstUser = [];
  const sharesSecondUser = [];

  for (var i = 0; i < firstUserQty; i++) {
    sharesFirstUser.push({
      id: `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`,
      user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
      title: `Veja como utilizar o V8 da melhor maneira - Parte ${i + 1}`,
      thumbnail: 'https://google.com.br/logo',
      link: 'https://google.com.br',
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  for (var i = 0; i < secondUserQty; i++) {
    sharesSecondUser.push({
      id: `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4() + s4() + s4()}`,
      user_id: '4eb8065f-4483-4877-bfb5-147eb8d2766c',
      title: `Introdução a NodeJS - Parte ${i + 1}`,
      thumbnail: 'https://google.com.br/logo',
      link: 'https://google.com.br',
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  const totalShares = sharesFirstUser.concat(sharesSecondUser);

  return knex('shares').insert(totalShares);
}
