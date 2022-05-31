const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true, min: 3, max: 60 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: { type: String, required: false, min: 3, max: 260 },
  createdOn: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, min: 1900, max: 2022 },
  genre: { type: String, required: false, min: 1, max: 10 },
  poster: { type: String, required: false, min: 12, max: 80 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  // Always store coordinates longitude, latitude order.
  coords: {
    type: { type: String },
    coordinates: [Number],
  },
  reviews: [reviewSchema],
});
movieSchema.index({ coords: "2dsphere" });
mongoose.model("Movie", movieSchema);
