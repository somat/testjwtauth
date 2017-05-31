var JWTHelper = {};

var exjwt = require('express-jwt');
var config = require('./config');
var Revoked = require('./models/revoked');

/**
 * Check revoked token
 * @param  {Object}   req     Request
 * @param  {Object}   payload JWT
 * @param  {Function} done    Callback
 * @return {Boolean}          Boolean
 */
var isRevokedCallback = function(req, payload, done){
  var issued = payload.iat;
  var id = payload._id;

  Revoked.findOne({issued: issued, id: id})
  .then(function(data) {
    return done(null, !!data);
  })
  .catch(function(error) {
    return done(error);
  });

};

/**
 * JWT Middleware to protect request
 * @type {Middleware}
 */
JWTHelper.auth = exjwt({
  secret: config.secret,
  isRevoked: isRevokedCallback
});

module.exports = JWTHelper;
