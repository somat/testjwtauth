var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Revoked = new Schema({
  id: {
    type: String,
    required: true,
    index: {unique: true}
  },
  issued: {
    type: String,
    required: true,
    index: {unique: true}
  }
},
{
  timestamps: true
});

module.exports = mongoose.model('Revoked', Revoked);
