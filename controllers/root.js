'use strict';

exports.init = function(app) {
  app.get('/', root);
};

function root(req, res, next) {
  res.render('index.ect');
}
