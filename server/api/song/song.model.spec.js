'use strict';

var should = require('should');
var app = require('../../app');
var Song = require('./song.model');
var Mongoose = require('mongoose');

describe('Song Model', function() {
  before(function(done) {
    // Clear songs before testing
    Song.remove().exec().then(function() {
      done();
    });
  });

  afterEach(function(done) {
    Song.remove().exec().then(function() {
      done();
    });
  });

  describe('location', function() {
    it('should correctly return a location with a title/artist that has no spaces', function(done) {
      var song = Song.create({
        title: 'Florida',
        artist: 'Starfucker',
        url: 'https://soundcloud.com/starfucker_usa/florida',
        created_by: Mongoose.Types.ObjectId()
      },
      function(err, song) {
        if (err) throw err;
        song.location.should.equal('/songs/florida-starfucker');
        done();
      });
    });
  });
});
