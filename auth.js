var AuthController = {};
var jwt = require('jsonwebtoken');
var auth = require('basic-auth');
var config = require('./config');
var User = require('./models/user');

/**
 * Login handler
 * @param  {Object}   req  Request object
 * @param  {Object}   res  Response object
 * @return {Object}        Response object
 */
 AuthController.doLogin = function(req, res) {
  req.assert('username', 'Username cannot be empty').notEmpty();
  req.assert('password', 'Password cannot be empty').notEmpty();

  error = req.validationErrors();

  if(error) {
    res.status(200).json({
      success: false,
      message: 'Validation error.'
    });
  } else {
    User.authenticate()(req.body.username, req.body.password,
      function(err, user, options) {
        if (err) return next(err);
        if (user === false) {
          res.status(200).json({
            success: false,
            message: options.message
          });
        } else {
          req.login(user, function (err) {
            var token = {
              _id: user._id
            }

            var signed = jwt.sign(token, config.secret, {expiresIn: config.expiredIn});
            var client = new Buffer(user.clientId + ":" + user.clientSecret).toString('base64');

            res.status(200).json({
              success: true,
              message: 'Login success.',
              data: {
                username: user.username,
                fullname: user.fullname,
                client: client,
                refresh: user.refreshToken,
                token: signed
              }
            });
            
          });

        }
      }
    );
  }

}
