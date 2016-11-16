const db = require('../lib/db')

db.dropDatabase()
.then(() => process.exit(0))
.catch(err => {
  console.error(err.stack)
  process.exit(1)
})
