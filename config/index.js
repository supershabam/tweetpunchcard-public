'use strict';

var confrodo = require('confrodo')
  , envFile = __dirname + '/' + confrodo.env + '.json'
  , config
  ;

config = confrodo(envFile, 'ARGV');

module.exports = config;
