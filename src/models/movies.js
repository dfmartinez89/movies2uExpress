const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true, min: 3, max: 60 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: { type: String, required: false, min: 3, max: 260 },
  reviewLocation: { type: String },
  // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
  reviewGeoLocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'] // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedLocation: String
  },
  createdAt: { type: Date, default: Date.now }
})

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, min: 1900, max: 2023 },
  genre: { type: String, required: false, min: 1, max: 10 },
  poster: { type: String, required: false, min: 12, max: 80 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  location: { type: String },
  // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
  geoLocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'] // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedLocation: String
  },
  createdAt: { type: Date, default: Date.now },
  reviews: [reviewSchema]
})

module.exports = mongoose.model('Movie', movieSchema)
