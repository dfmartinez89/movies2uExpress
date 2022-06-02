const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");
require("dotenv/config");
const axios = require("axios");
const imdb = require("../utils/imdb");

const axiosOptions = {
  apikey: process.env.IMDB_KEY,
};

const getImdbResponse = async (criteria) => {
  const res = await axios
    .get(imdb.imdbUrl(axiosOptions.apikey, criteria))
    .catch(function (error) {
      console.log(error.toJSON());
    });
  return res.data;
};

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/* Search IMDb movies */
const findImdbMoviesBy = async (req, res) => {
  if (!req.query.criteria) {
    return res.status(403).json({
      message: "missing search criteria",
    });
  }
  const criteria = req.query.criteria;
  const data = await getImdbResponse(criteria);
  return res.status(200).json(data);
};

/* Search movies */
const searchUtils = async (req, res) => {
  const queryParams = req.query;
  //Find by title.
  if (queryParams.hasOwnProperty("title")) {
    try {
      const movie = await Movies.find({ title: req.query.title });
      if (movie.length === 0) {
        sendJSONresponse(res, 404, {
          message: "there are no movies with title " + req.query.title,
        });
      }
      res.status(200).json(movie);
    } catch (e) {
      console.log(e.message);
    }
    //Find by year
  } else if (queryParams.hasOwnProperty("year")) {
    if (isNaN(req.query.year)) {
      return res.status(422).json({
        message: "request validation error",
      });
    } else {
      parseYear = req.query.year;
    }
    try {
      const movie = await Movies.find({ year: parseYear });
      if (movie.length === 0) {
        sendJSONresponse(res, 404, {
          message: "there are no movies on year " + req.query.year,
        });
      }
      res.status(200).json(movie);
    } catch (e) {
      console.log(e.message);
    }
    //Find by genre
  } else if (queryParams.hasOwnProperty("genre")) {
    try {
      const movie = await Movies.find({ genre: req.query.genre });
      if (movie.length === 0) {
        sendJSONresponse(res, 404, {
          message: "there are no movies with genre " + req.query.genre,
        });
      }
      res.status(200).json(movie);
    } catch (e) {
      console.log(e.message);
    }
  } else {
    return res.status(400).json({
      message: "missing search criteria, use title, year or genre",
    });
  }
};

module.exports = { searchUtils, findImdbMoviesBy, getImdbResponse };
