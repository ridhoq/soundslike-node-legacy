'use strict';

var should = require('should');
var mongoose = require('mongoose');
var app = require('../../app');
var User = require('../user/user.model');
var Song = require('./song.model');
var request = require('supertest');

describe('Song API', function() {

  var user;
  var admin;
  var anotherUser;

  // Clear users before testing
  before(function(done) {
    User.remove(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@test.com',
        password: 'password'
      });

      admin = new User({
        name: 'Fake Admin',
        email: 'admin@admin.com',
        password: '1234567890',
        role: 'admin'
      });

      anotherUser = new User({
        name: 'Another Fake User',
        email: 'anotherUser@test.com',
        password: 'anotherPassword'
      });

      user.save(function(err) {
        if (err) return done(err);
        admin.save(function(err) {
          if (err) return done(err);
          anotherUser.save(function(err) {
            if (err) return done(err);
            done();
          });
        });
      });
    });
  });

  // Clear users after testing
  after(function() {
    return User.remove().exec();
  });

  describe('GET /api/songs', function() {
    var userToken;
    var adminToken;

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
          if (err) done(err);
          userToken = res.body.token;
          request(app)
            .post('/auth/local')
            .send({
              email: 'admin@admin.com',
              password: '1234567890'
            })
            .expect(200)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) done(err);
              adminToken = res.body.token;
              done();
            });
        });
    });

    it('should respond with JSON array when logged in as an admin', function(done) {
      request(app)
        .get('/api/songs')
        .set('authorization', 'Bearer ' + adminToken)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.be.instanceof(Array);
          done();
        });
    });

    it('should respond with an error when logged in as a user', function(done) {
      request(app)
        .get('/api/songs')
        .set('authorization', 'Bearer ' + userToken)
        .expect(403, done);
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

    beforeEach(function(done) {
      Song.remove({}, done);
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
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.should.have.property('_id');
          res.body.title.should.equal(song.title);
          res.body.artist.should.equal(song.artist);
          res.body.url.should.equal(song.url);
          res.get('location').should.equal('/api/songs/' + res.body._id);
          res.body.createdBy.should.equal(user._id.toString());
          done();
        });
    });

    it('should respond with an error when creating a song with a url that has already been used', function(done) {
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
        .end(function(err) {
          if (err) return done(err);
          request(app)
            .post('/api/songs')
            .set('authorization', 'Bearer ' + token)
            .send(song)
            .expect(400)
            .end(done);
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

  describe('GET /api/songs/:id', function() {
    var token;
    var song = {
      title: 'Hyrule Kastle',
      artist: 'High Klassified',
      url: 'https://soundcloud.com/high-klassified/high-klassified-hyrule-kastle'
    };
    var songId;

    before(function(done) {
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .end(function(err, res) {
          token = res.body.token;
          request(app)
          .post('/api/songs')
          .set('authorization', 'Bearer ' + token)
          .send(song)
          .expect(201)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            songId = res.body._id;
            done();
          });
        });
    });

    it('should retrieve the correct Song data when given the corresponding id', function(done) {
      request(app)
        .get('/api/songs/' + songId)
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) return done(err);
          res.body.title.should.equal(song.title);
          res.body.artist.should.equal(song.artist);
          res.body.url.should.equal(song.url);
          done();
        });
    });

    it('should return with an error when given an invalid id', function(done) {
      var nullSongId = mongoose.Types.ObjectId();
      request(app)
        .get('/api/songs/' + nullSongId)
        .expect(404, done);
    });
  });

  describe('PUT /api/songs/:id', function() {
    var song = {
      title: 'Work',
      artist: 'A$AP Ferg',
      url: 'https://soundcloud.com/asapferg/work'
    };

    var modifiedSong = {
      title: 'Work (Remix)',
      artist: 'A$AP Ferg ft. A$AP Rocky, French Montana, SchoolBoy Q & Trinidad James',
      url: 'https://soundcloud.com/asapferg/work-remix-ft-a-ap-rocky'
    };

    var songId;

    before(function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .end(function(err, res) {
          token = res.body.token;
          request(app)
          .post('/api/songs')
          .set('authorization', 'Bearer ' + token)
          .send(song)
          .expect(201)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            songId = res.body._id;
            done();
          });
        });
    });

    it('should modify the Song when given valid data', function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'admin@admin.com',
          password: '1234567890'
        })
        .expect(200)
        .end(function(err, res) {
          token = res.body.token;
          request(app)
          .put('/api/songs/' + songId)
          .set('authorization', 'Bearer ' + token)
          .send(modifiedSong)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) return done(err);
            res.body.title.should.equal(modifiedSong.title);
            res.body.artist.should.equal(modifiedSong.artist);
            res.body.url.should.equal(modifiedSong.url);
            done();
          });
        });
    });

    it('should respond with an error when a user makes the request', function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .end(function(err, res) {
          token = res.body.token;
          request(app)
          .put('/api/songs/' + songId)
          .set('authorization', 'Bearer ' + token)
          .send(modifiedSong)
          .expect(403, done);
        });
    });
  });

  describe('DELETE /api/songs/:id', function() {
    var song = {
      title: 'Coronus, The Terminator',
      artist: 'Flying Lotus',
      url: 'https://soundcloud.com/flyinglotus/coronus-the-terminator'
    };
    var songId;
    var deleted = true;

    beforeEach(function(done) {
      if (deleted) {
        var token;
        request(app)
          .post('/auth/local')
          .send({
            email: 'test@test.com',
            password: 'password'
          })
          .expect(200)
          .end(function(err, res) {
            token = res.body.token;
            request(app)
            .post('/api/songs')
            .set('authorization', 'Bearer ' + token)
            .send(song)
            .expect(201)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) return done(err);
              songId = res.body._id;
              done();
            });
          });
      }
      else {
        done();
      }
    });

    it('should delete the Song when deleted by the song creator', function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'test@test.com',
          password: 'password'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          token = res.body.token;
          request(app)
          .delete('/api/songs/' + songId)
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(function(err) {
            if (err) return done(err);
            deleted = true;
            request(app)
            .get('/api/songs/' + songId)
            .expect(404, done);
          });
        });
    });

    it('should delete the Song when deleted by an admin', function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'admin@admin.com',
          password: '1234567890'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          token = res.body.token;
          request(app)
          .delete('/api/songs/' + songId)
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(function(err) {
            if (err) return done(err);
            deleted = true;
            request(app)
            .get('/api/songs/' + songId)
            .expect(404, done);
          });
        });
    });

    it('should return an error when a random user tries to delete a song', function(done) {
      var token;
      request(app)
        .post('/auth/local')
        .send({
          email: 'anotherUser@test.com',
          password: 'anotherPassword'
        })
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err);
          token = res.body.token;
          deleted = false;
          request(app)
          .delete('/api/songs/' + songId)
          .set('authorization', 'Bearer ' + token)
          .expect(403, done)
        });
    });

    it('should return an error when deleting a song with no auth', function(done) {
      deleted = false;
      request(app)
      .delete('/api/songs/' + songId)
      .expect(401, done);
    });

  });
});
