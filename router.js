var express = require('express');
var passport = require('passport');
var router = express.Router();
var jwt = require('./jwt');
var auth = require('./auth');

// Root
router.get('/', function(req, res) {res.json({message: 'Hello.'})});

// Auth
router.post('/login', auth.doLogin);
router.post('/register', auth.register);
router.post('/refresh', auth.refreshToken);

module.exports = router;
