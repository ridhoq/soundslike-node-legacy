'use strict';

var should = require('should');
var app = require('../../app');
var request = require('supertest');
var User = require('../user/user.model');

describe('Edges API', function() {
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

    // Clear users after testing
    after(function() {
      return User.remove().exec();
    });
  });

  describe('GET /api/edges', function() {
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
        .get('/api/edges')
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
        .get('/api/edges')
        .set('authorization', 'Bearer ' + userToken)
        .expect(403, done);
    });
  });

});
