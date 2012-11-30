'use strict';

var http = require('http')
  , app = require('./app')
  , config = require('./config')
  ;

console.log('listening on ', config.port);
http.createServer(app).listen(config.port);


require('./service/worker');
