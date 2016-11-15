module.exports = bookshelf => bookshelf.model('User', {
  tableName: 'users',
  hidden: [ 'password' ],
  bcrypt: { field: 'password' }
})
