const db = require('../../lib/db')
const Shares = db.model('Share')

exports.findAll = (req, res) => {
  return Shares
    .findAll({}, { withRelated: ['user'] })
    .limit(req.query.limit)
    .offset(req.query.offset)
    .then(collection => res.send(collection))
}

exports.findOne = (req, res) => {
  return Shares
    .findById(req.params.id, { withRelated: ['user'] })
    .then(share => {
      if (!share) return res.status(404).end()
      return res.send(share)
    })
}

exports.remove = (req, res) => {
  if (req.params.id !== req.session.user_id) return res.status(403).end();

  return Shares
    .forge({ id: req.params.id })
    .destroy()
    .then(() => res.send({ success: true }))
}

exports.create = (req, res) => {
  return Shares
    .create(req.body)
    .then(share => res.send(share))
}
