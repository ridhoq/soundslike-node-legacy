'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SongSchema = new Schema({
  title: {type: String, required: true},
  artist: {type: String, required: true},
  url: {type: String, required: true},
  created_by: {type: Schema.Types.ObjectId, required: true}
});

module.exports = mongoose.model('Song', SongSchema);