'use strict';

var async = require('async')
  , moment = require('moment')
  , db = require('./db')
  , twitter = require('../lib/twitter')
  , punchcard = require('../lib/punchcard')
  , tweetBlipsCol = db.collection('tweet_blips')
  , punchcardCol = db.collection('punchcard')
  ;

exports.calculatePunchcard = function(blips) {
  var dates = []
    , i
    ;

  for (i = 0; i < blips.length; ++i) {
    dates.push(blips[i].date);
  }

  return punchcard.getPunchcardFromDates(dates);
};

exports.savePunchcard = function(twitterHandle, punchcard, cb) {
  var spec
    , doc
    ;

  spec = {
    handle: twitterHandle
  };
  doc = {
    handle: twitterHandle,
    punchcard: punchcard,
    last_update: new Date()
  };

  punchcardCol.update(spec, doc, {upsert: true}, cb);
};

exports.isPunchcardReady = function(twitterHandle, cb) {
  var query;

  query = {
    handle: twitterHandle,
    last_update: {
      $gte: moment().utc().subtract('days', 1).endOf('day').toDate()
    }
  };

  punchcardCol.findOne(query, function(err, doc) {
    var ready;

    if (err) return cb(err);

    if (!doc) return cb(null, false);
    return cb(null, true);
  });
};

exports.getPunchcard = function(twitterHandle, cb) {
  var query;

  query = {
    handle: twitterHandle
  };

  punchcardCol.findOne(query, function(err, doc) {
    if (err) return cb(err);
    if (!doc) return cb(new Error('punchcard not ready'));

    return cb(null, doc.punchcard);
  });
};

exports.ensureBlips = function(twitterHandle, targetDate, cb) {
  exports.getMostRecentBlip(twitterHandle, function(err, mostRecentBlip) {
    var targetId;

    if (err) return cb(err);
    if (mostRecentBlip) {
      targetId = mostRecentBlip.id;
    }

    twitter.getTweetBlipsUntil(twitterHandle, targetDate, targetId, function(err, blips) {
      if (err) return cb(err);

      exports.insertBlips(blips, cb);
    });
  });
};

exports.getBlips = function(twitterHandle, after, before, cb) {
  var query
    , sort
    ;

  query = {
    handle: twitterHandle,
    date: {
      $gte: after,
      $lte: before
    }
  };
  sort = [['date', -1]];

  tweetBlipsCol.find(query, {sort: sort}).toArray(cb);
};

exports.insertBlips = function(blips, cb) {
  var work = []
    , i
    ;

  for (i = 0; i < blips.length; ++i) {
    (function(index) {
      work.push(function(callback) {
        var spec
          , doc
          ;

        spec = {
          id: blips[index].id
        };
        doc = blips[index];

        tweetBlipsCol.update(spec, doc, {upsert: true}, callback);
      });
    })(i);
  }

  async.parallel(work, cb);
};

exports.getMostRecentBlip = function(twitterHandle, cb) {
  tweetBlipsCol.findOne({handle: twitterHandle}, {sort: [['date', -1]]}, cb);
};
