'use strict';

var workerService = require('../service/worker')
  , twitterService = require('../service/twitter')
  , twitter = require('../lib/twitter')
  ;

exports.init = function(app) {
  app.get('/api/punchcard', 
    getPunchcard);
};

function getPunchcard(req, res, next) {
  var twitterHandle = req.query.handle
    , _next = next
    ;

  next = function(err) {
    console.error(err);
    return res.json({success: false, error: String(err) });
  };

  if (!twitterHandle) return next(new Error('must specify handle'));
  twitterHandle = twitterHandle.toLowerCase();

  twitter.isValidHandle(twitterHandle, function(err, isValid) {
    if (err) return next(err);
    if (!isValid) return next(new Error('invalid twitter handle'));

    twitterService.isPunchcardReady(twitterHandle, function(err, ready) {
      if (err) return next(err);

      if (ready) {
        twitterService.getPunchcard(twitterHandle, function(err, punchcard) {
          if (err) return next(err);

          return res.json({
            success: true,
            status: 'ready',
            punchcard: punchcard
          });
        });
      } else {
        workerService.ensureWorker(twitterHandle, function(err) {
          if (err) return next(err);

          return res.json({
            success: true,
            status: 'pending'
          });
        });
      }
    });
  });
}
