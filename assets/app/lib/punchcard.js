'use strict';

/**
 * Returns adjusted punchcard to the timezone specified, where offset
 * is specified in minutes
 */
exports.translateToTimezone = function(punchcard, offset) {
  // turn offset into hours
  var hourOffset = Math.round(offset/60);
  while (hourOffset !== 0) {
    if (hourOffset < 0) {
      hourOffset++;
      punchcard.unshift(punchcard.pop());
    } else {
      hourOffset--;
      punchcard.push(punchcard.shift());
    }
  }
};
