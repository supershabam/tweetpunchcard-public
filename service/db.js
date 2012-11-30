'use strict';

var mongoskin = require('mongoskin')
  , config = require('../config')
  , db
  ;

db = mongoskin.db(config.mongourl);

module.exports = db;
