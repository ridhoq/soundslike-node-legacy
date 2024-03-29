'use strict';

var _ = require('lodash');
var Song = require('./song.model');
var User = require('../user/user.model');
var errorHelper = require('mongoose-error-helper').errorHelper;
var mongoose = require('mongoose');

// Get list of songs
exports.index = function(req, res) {
  Song.find(function (err, songs) {
    if(err) { return handleError(res, err); }
    return res.json(200, songs);
  });
};

// Get a single song
exports.show = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    return res.json(song);
  });
};

// Creates a new song in the DB.
exports.create = function(req, res) {
  Song.create(
    {
      title: req.body.title,
      artist: req.body.artist,
      url:req.body.url,
      createdBy: req.user._id
    },
    function(err, song) {
      if(err) { return handleError(res, err); }
      res.location(song.apiLocation);
      User.findByIdAndUpdate(req.user._id,
        {$push: {songsCreated: song._id}},
        function(err) {
          if(err) { return handleError(res, err); }
          return res.json(201, song);
        });
    });

};

// Updates an existing song in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Song.findById(req.params.id, function (err, song) {
    if (err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    var updated = _.merge(song, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, song);
    });
  });
};

// Deletes a song from the DB.
exports.destroy = function(req, res) {
  Song.findById(req.params.id, function (err, song) {
    if(err) { return handleError(res, err); }
    if(!song) { return res.send(404); }
    var userId = mongoose.Types.ObjectId(req.user._id);
    if (song.createdBy.equals(userId) || req.user.role === 'admin') {
      song.remove(function(err) {
        if(err) { return handleError(res, err); }
        return res.send(204);
      });
    }
    else {
      return res.send(403);
    }
  });
};

function handleError(res, err) {
  var statusCode = 500;
  if (err.name === 'ValidationError') {
    err = errorHelper(err);
    statusCode = 400;
  }
  if (err.name === 'MongoError' && err.code === 11000) {
    err = ['A song with that url already exists'];
    statusCode = 400;
  }
  return res.json(statusCode, err);
}
