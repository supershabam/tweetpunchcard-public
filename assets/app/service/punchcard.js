'use strict';

exports.getPunchcard = function(twitterHandle, cb) {
  return getPunchcard(twitterHandle, 20, cb);
};

function getPunchcard(twitterHandle, numRetries, cb) {
  if (numRetries < 0) return cb(new Error('timeout'));

  $.ajax({
    type: 'GET',
    url: '/api/punchcard',
    data: {
      handle: twitterHandle
    }
  })
  .success(function(response, status, jqXhr) {
    if (!response.success) return cb(new Error(response.error || 'ajax error'));
    if (response.success && response.status === 'pending') {
      return setTimeout(function() {
        getPunchcard(twitterHandle, numRetries - 1, cb);
      }, 2500);
    }

    if (response.success && response.punchcard) return cb(null, response.punchcard);
    return cb(new Error('ajax error'));
  })
  .error(function() {
    return cb(new Error('ajax error'));
  });
}