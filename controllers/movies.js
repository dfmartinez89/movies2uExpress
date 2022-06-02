require("dotenv/config");
const mongoose = require("mongoose");
const Movies = require("../models/movies");
const geocoder = require("../utils/geocoder");

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/* GET /movies */
const moviesFindAll = async (req, res, next) => {
  try {
    const movies = await Movies.find();
    return res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (e) {
    res.status(500).json({
      error: "Server error",
    });
  }
};

/* GET /movies/:movieid */
const moviesReadOne = async (req, res, next) => {
  try {
    const movie = await Movies.findById(req.params.movieid);
    return res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (e) {
    res.status(404).json({
      error: "movie not found",
    });
  }
};

/* POST /movies */
const moviesCreate = async (req, res, next) => {
  if (!req.body.location) {
    sendJSONresponse(res, 400, { message: "location is required" });
  } else {
    try {
      const loc = await geocoder.geocode(req.body.location);
      const parseLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedLocation: loc[0].formattedAddress,
      };
      const movie = await Movies.create({
        title: req.body.title,
        year: req.body.year,
        genre: req.body.genre,
        poster: req.body.poster,
        rating: req.body.rating,
        geoLocation: parseLocation,
      });
      return res.status(201).json({
        success: true,
        data: movie,
      });
    } catch (e) {
      res.status(406).json(e.message);
    }
  }
};

/* PUT /movies/:moviesid */
const moviesUpdateOne = async (req, res, next) => {
  if (!req.body.location) {
    sendJSONresponse(res, 400, { message: "location is required" });
  } else {
    try {
      const loc = await geocoder.geocode(req.body.location);
      const parseLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedLocation: loc[0].formattedAddress,
      };
      Movies.findOneAndUpdate({ id: req.params.movieid }, { new: true }).exec(
        (err, movie) => {
          if (!movie) {
            sendJSONresponse(res, 404, { message: "movie not found" });
          } else if (err) {
            sendJSONresponse(res, 406, err._message);
          }
          movie.title = req.body.title;
          movie.year = req.body.year;
          movie.genre = req.body.genre;
          movie.poster = req.body.poster;
          movie.rating = req.body.rating;
          movie.geoLocation = parseLocation;
          //not updating reviews via this endpoint1
          movie.save((err, movie) => {
            if (err) {
              sendJSONresponse(res, 406, err._message);
            } else {
              sendJSONresponse(res, 200, movie);
            }
          });
        }
      );
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
};

/* DELETE movies/:movieid */
const moviesDeleteOne = async (req, res) => {
  try {
    await Movies.findByIdAndRemove(req.params.movieid);
    return res.status(204).json({
      success: true,
      movieid: req.params.movieid,
    });
  } catch (e) {
    res.status(404).json(e.message);
  }
};

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne,
};
