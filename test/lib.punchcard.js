'use strict';

var moment = require('moment')
  , should = require('should')
  , _ = require('underscore')
  , punchcard = require('../lib/punchcard')
  ;

describe('lib/punchcard', function() {
  describe('#dateToIndex', function() {
    it('should return zero for sunday at midnight', function() {
      // Sunday, 18 November 2012 at 00
      var date = moment('2012-11-18T00Z').toDate()
        , index = punchcard.dateToIndex(date)
        ;

      index.should.equal(0);
    })
    it('should return zero for sunday at one second before 1am', function() {
      // Sunday, 18 November 2012 at 00:59:59
      var date = moment('2012-11-18T005959Z')
        , index = punchcard.dateToIndex(date)
        ;

      index.should.equal(0);
    })
    it('should return 1 for sunday at 1am', function() {
      // Sunday, 18 November 2012 at 1:00:00
      var date = moment('2012-11-18T01Z')
        , index = punchcard.dateToIndex(date)
        ;

      index.should.equal(1);
    })
    it('should return (24 * 7) - 1 for saturday at one second to midnight', function() {
      // Saturday, 17 November 2012 at 23:59:59
      var date = moment('2012-11-17T235959Z')
        , index = punchcard.dateToIndex(date)
        ;

      index.should.equal((24 * 7) - 1);
    })
  })

  describe('#getPunchcardFromDates', function() {
    it('should return array of length 24 * 7 where each value is 0', function() {
      var card = punchcard.getPunchcardFromDates([]);

      card.length.should.equal(24 * 7);
      card.forEach(function(value) {
        value.should.equal(0);
      })
    })
    it('should return array with one hit on sunday at midnight', function() {
      var card = punchcard.getPunchcardFromDates([
        // Sunday, 18 November 2012 at 00
        moment('2012-11-18T00Z').toDate()
      ]);


      _.filter(card, function(value) {
        return value === 0;
      }).length.should.equal((24 * 7) - 1);
      card[0].should.equal(1);
    })
    it('should return array with two hits on sunday at midnight', function() {
      var card = punchcard.getPunchcardFromDates([
        moment('2012-11-18T00Z').toDate(),
        moment('2012-11-18T00:59:59Z').toDate(),
        moment('2012-11-18T01Z').toDate(),
        moment('2012-11-17T235959Z').toDate()
      ])

      card[0].should.equal(2);
      card[1].should.equal(1);
      card[card.length - 1].should.equal(1);
      _.filter(card, function(value) {
        return value === 0;
      }).length.should.equal((24 * 7) - 3);
    })
  })
})
