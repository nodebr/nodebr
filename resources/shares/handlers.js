const db = require('../../lib/db');
const Share = db.model('Share');

exports.findLimitedByPage = (req, res) => {
  const offset = req.query.page * limit;

  return Share
    .limit(limit)
    .offset(offset)
    .then(collection => res.send(collection));
};

exports.findOne = (req, res) => {
  return Share.findById(req.params.id)
    .then(share => res.send(share));
};

exports.remove = (req, res) => {
  return Share.forge({ id: req.params.id })
    .destroy()
    .then(() => res.send({ success: true }));
};

exports.create = (req, res) => {
  return Share.create(req.body)
    .then(share => res.send(share));
};
