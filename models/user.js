var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        index: {unique: true}
    },
    clientId: {
      type: String,
      required: true,
      index: {unique: true}
    },
    clientSecret: {
      type: String,
      required: true
    },
    accessToken: {
      type: String
    },
    refreshToken: {
      type: String,
      required: true
    },
    fullname: {
      type: String,
      required: true
    }
},
{
  timestamps: true
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
