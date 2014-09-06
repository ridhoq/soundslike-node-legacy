'use strict';

var should = require('should');
var mongoose = require('mongoose');
var app = require('../../app');
var User = require('../user/user.model');
var request = require('supertest');

describe('Song API', function() {

  var user;

  // Clear users before testing
  before(function(done) {
    User.remove(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      user.save(function(err) {
        if (err) return done(err);
        done();
      });
    });
  });

  // Clear users after testing
  after(function() {
    return User.remove().exec();
  });

  describe('GET /api/songs', function() {

    it('should respond with JSON array', function(done) {
      request(app)
        .get('/api/songs')
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          done();
        });
    });
  });

  describe('POST /api/songs/', function() {
    var token;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          token = res.body.token;
          done();
        });
    });

    it('should respond with a Song JSON object given a valid body', function(done) {
      var song = {
        title: 'Hours',
        artist: 'Tycho',
        url: 'https://soundcloud.com/tycho/hours'
      };
      request(app)
        .post('/api/songs')
        .set('authorization', 'Bearer ' + token)
        .send(song)
        .expect(201)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('_id');
          res.body.title.should.equal(song.title);
          res.body.artist.should.equal(song.artist);
          res.body.url.should.equal(song.url);
          res.get('location').should.equal('/songs/hours-tycho');
          res.body.created_by.should.equal(user._id.toString());
          User.findById(user._id, function(err, checkUser) {
            if (err) return done(err);
            checkUser.created_songs.should.containEql(mongoose.Types.ObjectId(res.body._id));
            done();
          });
       });
    });

    it('should respond with an error when given invalid data', function(done) {
      var song = {};
      request(app)
        .post('/api/songs')
        .set('authorization', 'Bearer ' + token)
        .send(song)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.length(3);
      });
      song = {
        title: 'Hours'
      };
      request(app)
        .post('/api/songs')
        .set('authorization', 'Bearer ' + token)
        .send(song)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.length(2);
      });
      song = {
        title: 'Hours',
        artist: 'Tycho'
      };
      request(app)
        .post('/api/songs')
        .set('authorization', 'Bearer ' + token)
        .send(song)
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.length(1);
          done();
      });
    });

    it('should respond with an error when not authenticated', function(done) {
      var song = {
        title: 'Hours',
        artist: 'Tycho',
        url: 'https://soundcloud.com/tycho/hours'
      };
      request(app)
        .post('/api/songs')
        .send(song)
        .expect(401)
        .end(done);
    });
  });
});
