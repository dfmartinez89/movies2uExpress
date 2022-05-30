const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

/* GET movies by title */
const searchUtils = (req, res) => {
    queryParams = req.query;
    if (queryParams.hasOwnProperty("title")) {
      Movies.find({ title: req.query.title }).exec((err, movie) => {
        if (movie.length === 0) {
          return res.status(404).json({
            message: "there are no movies with title " + req.query.title + "",
          });
        } else if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(movie);
      });
    } else if (queryParams.hasOwnProperty("year")) {
      Movies.find({ year: req.query.year }).exec((err, movie) => {
        if (movie.length === 0) {
          return res.status(404).json({
            message: "there are no movies on year " + req.query.year + "",
          });
        } else if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(movie);
      });
    } else if (queryParams.hasOwnProperty("genre")) {
      Movies.find({ genre: req.query.genre }).exec((err, movie) => {
        if (movie.length === 0) {
          return res.status(404).json({
            message: "there are no movies with genre " + req.query.genre + "",
          });
        } else if (err) {
          return res.status(404).json(err);
        }
        res.status(200).json(movie);
      });
    } else {
      return res.status(404).json({
        message: "search criteria is not allowed, use title, year or genre",
      });
    }
  };


  module.exports = {searchUtils}