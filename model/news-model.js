var mongoose = require('mongoose');
var paginate = require('mongoose-paginate');
var slug = require('slug');
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
  slug: {
    type: String
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
  },
  comments: [{
    user: {
      name: String,
      email: String
    },
    created: {
      type: Date,
      default: Date.now
    }
  }],
});

echoSchema.pre('save', function(next){
  this.slug = slug(this.title);
  next();
});

echoSchema.plugin(paginate);

module.exports = mongoose.model('news', echoSchema);
