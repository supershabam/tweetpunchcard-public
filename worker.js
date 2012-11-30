'use strict';

var moment = require('moment')
  , workerService = require('./service/worker')
  , twitter = require('./lib/twitter')
  , twitterService = require('./service/twitter')
  ;

(function doWork() {
  workerService.dequeueWork(function(err, work) {
    if (err) {
      console.error(err);
      return process.nextTick(doWork);
    }

    // nothing, wait for 0.5 seconds
    if (!work) return setTimeout(doWork, 500);

    handleWork(work, function(err) {
      console.log('handled work', arguments);

      if (err) console.error(err);

      workerService.completeWork(work.handle, function(err) {
        if (err) console.error(err);

        return process.nextTick(doWork);  
      });
    });
  });
})();

function handleWork(work, cb) {
  console.log('handling work', work);

  var tooOld = moment().utc().subtract('hours', 1)
    , twitterHandle = work.handle
    , targetDate = moment().utc().subtract('days', 7 * 4).startOf('day').toDate()
    ;

  if (work.polled.valueOf() < tooOld.valueOf()) return cb();

  twitterService.ensureBlips(twitterHandle, targetDate, function(err) {
    if (err) return cb(err);

    var beforeDate = moment().utc().subtract('days', 1).endOf('day').toDate();

    console.log('get blips after', targetDate, 'before', beforeDate);
    twitterService.getBlips(twitterHandle, targetDate, beforeDate, function(err, blips) {
      if (err) return cb(err);

      var punchcard = twitterService.calculatePunchcard(blips);
      twitterService.savePunchcard(twitterHandle, punchcard, cb);
    });
  });
}
