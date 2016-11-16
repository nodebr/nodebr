/**
 * Cria o modelo Share
 * @param {Function} bookshelf Uma instância do Bookshelf
 */
module.exports = bookshelf => bookshelf.model('Share', {
  tableName: 'shares',
  user: function () {
    return this.belongsTo('User')
  }
})
