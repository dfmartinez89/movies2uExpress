const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* Search movies */
const searchUtils = (req, res) => {
  queryParams = req.query;
  if (queryParams.hasOwnProperty("title")) {
    try {
      parseTitle = req.query.title.toString();
    } catch (error) {
      return res.status(422).json({
        message: "request validation error " + error.message + "",
      });
    }
    Movies.find({ title: parseTitle }).exec((err, movie) => {
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
    if (isNaN(req.query.year)) {
      return res.status(422).json({
        message: "request validation error " + error.message + "",
      });
    } else {
      parseYear = req.query.year;
    }

    Movies.find({ year: parseYear }).exec((err, movie) => {
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
    try {
      parseGenre = req.query.genre.toString();
    } catch (error) {
      return res.status(422).json({
        message: "request validation error " + error.message + " ",
      });
    }
    Movies.find({ genre: parseGenre }).exec((err, movie) => {
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

module.exports = { searchUtils };
