var config = {};

// App port
config.port = '5001';
config.env = 'dev';

// Database connection
config.db_string = 'mongodb://localhost/testauth';

// JWT Config
config.secret = 'secret';
config.expiredIn = "7 days";

module.exports = config;
