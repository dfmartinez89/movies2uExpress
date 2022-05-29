const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  author: String,
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: String,
  createdOn: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: Number,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  genre: String,
  poster: String,
  reviews: commentSchema,
});

mongoose.model("Movie", movieSchema);
