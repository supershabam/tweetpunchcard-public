'use strict';

var Twitter = require('bstwitter')
  , moment = require('moment')
  , config = require('../config')
  ;

exports.getClient = function(accessToken, accessTokenSecret) {
  accessToken = accessToken || config.twitter.access_token;
  accessTokenSecret = accessTokenSecret || config.twitter.access_secret;
  var twit = new Twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: accessToken,
    access_token_secret: accessTokenSecret
  });

  return twit;
};

exports.isValidHandle = function(twitterHandle, cb) {
  var client = exports.getClient()
    , params
    ;

  params = {
    screen_name: twitterHandle,
    include_entities: false
  };

  client.get('/users/show.json', params, function(err, user) {
    if (err && err.statusCode === 404) return cb(null, false);
    if (err) return cb(err);
    if (user) return cb(null, true);
    return cb(null, false);
  });
}

exports.getTweetBlips = function(twitterHandle, maxId, cb) {
  var client = exports.getClient()
    , params
    ;

  params = {};
  params['screen_name'] = twitterHandle;
  params['count'] = 200;
  if (maxId) {
    params['max_id'] = maxId;
  }

  client.get('/statuses/user_timeline.json', params, function(err, tweets) {
    var i
      , blip
      , blips = []
      ;

    if (err) return cb(err);

    tweets = tweets || [];
    for(i = 0; i < tweets.length; ++i) {
      blip = {
        id: tweets[i].id_str,
        handle: twitterHandle,
        date: moment(tweets[i].created_at).toDate()
      };
      if (blip.id === maxId) continue;
      blips.push(blip);
    }
    
    return cb(null, blips);
  });
};

/**
 * Recursively gets tweets until the target date or id is matched.
 * The most recent tweet is in index 0
 */
exports.getTweetBlipsUntil = function(twitterHandle, targetDate, targetId, cb) {
  console.log('getblipsuntil', arguments);
  exports.getTweetBlips(twitterHandle, null, function recurse(err, blips) {
    console.log('recurse', arguments);
    var earliestDate
      , maxId
      , i
      ;

    if (err) return cb(err);

    earliestDate = blips[blips.length - 1].date;
    maxId = blips[blips.length - 1].id;

    // exit if targetId is found
    for (i = 0; i < blips.length; ++i) {
      if (blips[i].id === targetId) return cb(null, blips);
    }

    // exit if targetDate is matched
    if (moment(earliestDate).valueOf() < moment(targetDate).valueOf()) {
      return cb(null, blips);
    }
    
    // moar data
    exports.getTweetBlips(twitterHandle, maxId, function(err, b) {
      recurse(err, blips.concat(b));
    });
  });
};
