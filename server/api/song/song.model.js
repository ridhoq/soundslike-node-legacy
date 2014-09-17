'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: {type: String, required: true},
  artist: {type: String, required: true},
  url: {type: String, required: true, unique: true},
  createdBy: {type: Schema.Types.ObjectId, required: true, ref: 'User'}
});

/**
 * Virtuals
 */
SongSchema
  .virtual('location')
  .get(function() {
    var location = this.title + '-' + this.artist;
    location = location.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    return '/songs/' + location;
  });

SongSchema
  .virtual('apiLocation')
  .get(function() {
    return '/api/songs/' + this._id;
  });

module.exports = mongoose.model('Song', SongSchema);
