'use strict';

var locksmith = require('locksmith')
  , config = require('../config')
  ;

module.exports = locksmith({
  host: config.locksmith.host,
  port: config.locksmith.port
});
