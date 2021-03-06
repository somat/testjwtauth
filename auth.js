var AuthController = {};
var jwt = require('jsonwebtoken');
var auth = require('basic-auth');
var config = require('./config');
var User = require('./models/user');
var random = require('./random');

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

/**
 * Handle user registration
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
AuthController.register = function(req, res) {
  req.assert('username', 'Username cannot be empty').notEmpty();
  req.assert('password', 'Password cannot be empty').notEmpty();
  req.assert('fullname', 'Fullname cannot be empty').notEmpty();

  error = req.validationErrors();

  if(error) {
    res.status(200).json({
      success: false,
      message: 'Validation error.'
    });
  } else {
    // Generate random token
    var clientId = random.randomValueHex(16);
    var clientSecret = random.randomValueBase64(16);
    var refreshToken = random.randomValueBase64(32);

    User.register(
      new User({
        username: req.body.username,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
        fullname: req.body.fullname
      }),
      req.body.password,
      function(err, user) {
        if(err) {
          res.status(200).json({
            success: false,
            message: 'Registration failed.'
          });
        } else {
            var token = {
              _id: user._id
            }
            var signed = jwt.sign(token, config.secret, {expiresIn: config.expiredIn});
            var client = new Buffer(user.clientId + ":" + user.clientSecret).toString('base64');
            user.accessToken = signed;
            user.save().
            then(function(user) {
              res.status(200).json({
                success: true,
                message: 'Registration success.',
                data: {
                  username: user.username,
                  fullname: user.fullname,
                  client: client,
                  refresh: user.refreshToken,
                  token: user.accessToken
                }
              });
            })
            .catch(function(err) {
              // Handle error
              res.status(500).json({
                success: false,
                message: 'Internal server error.'
              });
            });

        }
      }
    );
  }
}

/**
 * Refresh JWT Token
 * @param  {Object} req Request object
 * @param  {Object} res Response object
 * @return {Object}     Response object
 */
 AuthController.refreshToken = function(req, res) {

  // Validate input
  req.assert('access_token', 'Access Token required').notEmpty();
  req.assert('refresh_token', 'Refresh Token required').notEmpty();
  error = req.validationErrors();
  if(error) {
    return res.status(200).json({
      success: false,
      message: 'Validation error.'
    });
  }

  // Authenticate basic-auth
  // now user has user.name and user.pass
  var user = auth(req);
  if(!user) {
    return res.status(200).json({
      success: false,
      message: 'Authentication failed.'
    });
  }

  // Check refresh token
  var isValid = false;
  try {
    jwt.verify(req.body.access_token, config.secret);
  } catch (e) {
    if (e.name == "TokenExpiredError") {
      isValid = true;
    }
  }

  if(isValid) {
    try {
      var decoded = jwt.verify(
        req.body.access_token,
        config.secret,
        {ignoreExpiration: true}
        )
    } catch (e) {
      isValid = false;
    }
  }

  if (isValid && decoded) {
    User.findById(mongoose.Types.ObjectId(decoded._id))
    .then(function(result) {
      if (result.clientId == user.name &&
        result.clientSecret == user.pass &&
        result.refreshToken == req.body.refresh_token) {
            // Access token and request valid, generate new token
          var newToken = {
            _id: decoded._id
          }
          var signed = jwt.sign(newToken, config.secret, {expiresIn: config.expiredIn});
          res.status(200).json({
            success: true,
            message: 'Refresh token success.',
            data: {
              token: signed
            }
          });
        }
      });
  } else {
    return res.status(200).json({
      success: false,
      message: 'Invalide token.'
    });
  }
}

module.exports = AuthController;
