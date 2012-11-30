'use strict';

var should = require('should')
  , moment = require('moment')
  , twitter = require('../service/twitter')
  , db = require('../service/db')
  ;

describe('twitter', function() {
  before(function(done) {
    db.collection('tweet_blips').remove(done);
  })

  before(function(done) {
    db.collection('punchcard').remove(done);
  })

  describe('insert/get blips', function() {
    it('should have no recent blip', function(done) {
      twitter.getMostRecentBlip('supershabam', function(err, blip) {
        if (err) return done(err);

        if (blip !== null) return done('blip not null');
        return done();
      })
    })
    it('should insert two independent blips under supershabam', function(done) {
      var blips = [
        {
          handle: 'supershabam',
          id: '1234',
          date: moment('2012-11-19T00Z').toDate()
        },
        {
          handle: 'supershabam',
          id: '1235',
          date: moment('2012-11-18T00Z').toDate()
        },
        {
          handle: 'supershabam',
          id: '1235',
          date: moment('2012-11-18T00Z').toDate()
        }
      ];
      twitter.insertBlips(blips, function(err) {
        if (err) return done(err);

        db.collection('tweet_blips').count({handle: 'supershabam'}, function(err, count) {
          if (err) return done(err);

          count.should.equal(2);

          done();
        })
      })
    })
    it('should have 19th as most recent blip', function(done) {
      twitter.getMostRecentBlip('supershabam', function(err, blip) {
        if (err) return done(err);

        blip.date.should.equal(moment('2012-11-19T00Z').toDate());
        return done();
      })
    })
  })

  describe('punchcard', function() {
    it('should not be ready', function(done) {
      twitter.isPunchcardReady('supershabam', function(err, ready) {
        if (err) return done(err);

        ready.should.equal(false);
        done();
      })
    })

    it('should save punchcard and be ready', function(done) {
      twitter.savePunchcard('supershabam', [], function(err) {
        if (err) return done(err);

        twitter.isPunchcardReady('supershabam', function(err, ready) {
          if (err) return done(err);

          ready.should.equal(true);
          done();
        })
      })
    })

    it('should make punchard old and not ready', function(done) {
      var query
        , update
        ;

      query = {
        handle: 'supershabam'
      };
      update = {
        $set: {
          last_update: moment().utc().subtract('days', 1).endOf('day').subtract('minutes', 1).toDate()
        }
      };

      db.collection('punchcard').update(query, update, function(err) {
        if (err) return done(err);

        twitter.isPunchcardReady('supershabam', function(err, ready) {
          if (err) return done(err);

          ready.should.equal(false);
          done();
        })
      })
    })
  })
})