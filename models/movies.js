const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  author: String,
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: String,
  createdOn: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: Number,
  genre: String,
  poster: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  coords: {
    type: { type: String },
    coordinates: [Number],
  },
  reviews: [reviewSchema],
});
movieSchema.index({coords: '2dsphere'});
module.exports = mongoose.model("Movie", movieSchema);
