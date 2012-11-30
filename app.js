'use strict';

var express = require('express')
  , connectAssets = require('connect-assets')
  , browserify = require('browserify')
  , ECT = require('ect')
  , controllers = require('./controllers')
  , oneYear = 365 * 24 * 60 * 60 * 1000
  , app = express()
  ;

controllers.init(app);

app.engine('.ect', ECT({
  cache: true,
  watch: true,
  root: __dirname + '/views'
}).render);
app.use(browserify()
  .addEntry(__dirname + '/assets/app/main.js')
);
app.use(connectAssets());
app.use(express.static(__dirname + "/assets", { maxAge: oneYear }));
app.use(app.router);

module.exports = app;
