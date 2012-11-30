'use strict';

exports.init = function(app) {
  require('./root').init(app);
  require('./api').init(app);
};
