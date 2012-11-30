'use strict';

var db = require('./db')
  , locksmith = require('../lib/locksmith')
  , queueCol = db.collection('queue')
  ;

/**
 * Ensure that there is a request for work on this twitter handle
 * either in progress or queued.
 */
exports.ensureWorker = function(twitterHandle, cb) {
  locksmith(twitterHandle, function(err, release) {
    if (err) return cb(err);

    var query = {
      handle: twitterHandle
    };

    queueCol.findOne(query, function(err, doc) {
      if (err) {
        release();
        return cb(err);
      }

      // already have a doc, update the polled and then we're done
      if (doc) {
        queueCol.update({_id: doc._id}, {$set: {polled: new Date()}}, function(err) {
          release();

          if (err) return cb(err);
          return cb();
        });
      }

      // insert a new doc
      else {
        doc = {
          handle: twitterHandle,
          status: 'waiting',
          created: new Date(),
          polled: new Date()
        };

        queueCol.insert(doc, function(err) {
          release();

          if (err) return cb(err);

          return cb();
        });
      }
    });
  });
};

exports.dequeueWork = function(cb) {
  var query
    , sort
    , update
    , options
    ;

  query = {
    status: 'waiting'
  };
  sort = [['created', 1]];
  update = {
    $set: {
      status: 'working'
    }
  };
  options = {
    new: true
  };

  queueCol.findAndModify(query, sort, update, options, cb);
};

exports.completeWork = function(twitterHandle, cb) {
  locksmith(twitterHandle, function(err, release) {
    if (err) return cb(err);

    var query = {
      handle: twitterHandle
    };

    queueCol.remove(query, function(err) {
      release();

      if (err) return cb(err);
      return cb();
    });
  });
};
