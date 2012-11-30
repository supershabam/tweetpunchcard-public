'use strict';

var moment = require('moment');

/**
 * Given a javascript date object, get the punchcard index
 * that this date should count for.
 *
 * Date is transformed into UTC, and each hour starting from
 * Sunday at midnight is an increment to the index.
 */
exports.dateToIndex = function(date) {
  var m = moment(date).utc()
    , dayOfWeek = m.day()
    , hourOfDay = m.hours()
    , index
    ;

  index = ( dayOfWeek * 24 ) + hourOfDay;

  return index;
};

/**
 * Given an array of date objects, create a punchcard counting
 * hourly occurences of a date.
 *
 * returns array of length 24 * 7
 * index 0 corresponds to Sunday at midnight - 0:59 UTC
 * index 1 => Sunday at 1am - 1:59am UTC
 *
 * value at index is the count of times a date occured
 */
exports.getPunchcardFromDates = function(dates) {
  var punchcard = _getBasePunchcard()
    , index
    , i
    ;

  for (i = 0; i < dates.length; ++i) {
    index = exports.dateToIndex(dates[i]);
    punchcard[index] = 1 + punchcard[index];
  }

  return punchcard;
};

function _getBasePunchcard() {
  var result = []
    , length
    , i
    ;

  length = 7 * 24;
  for (i = 0; i < length; ++i) {
    result[i] = 0;
  }

  return result;
}
