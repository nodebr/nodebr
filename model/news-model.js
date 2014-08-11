var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');
var echoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  karma: {
    type: Number,
    default: 0
  },
  user: {
    name: String,
    email: String
  },
  created: {
    type: Date,
    default: Date.now
  }
});

echoSchema.plugin(paginate);

module.exports = mongoose.model('news', echoSchema);
