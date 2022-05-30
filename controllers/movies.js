const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* GET /movies */
const moviesFindAll = (req, res) => {
  Movies.find({}).exec((err, movies) => {
    if (!movies) {
      sendJSONresponse(res, 404, { message: "movies not found" });
    } else if (err) {
      sendJSONresponse(res, 404, err);
    } else {
      sendJSONresponse(res, 200, movies);
    }
  });
};

/* POST /movies */
const moviesCreate = (req, res) => {
  Movies.create(
    {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      poster: req.body.poster,
      rating: req.body.rating,
    },
    (err, movie) => {
      if (err) {
        sendJSONresponse(res, 404, err);
      } else {
        sendJSONresponse(res, 201, movie);
      }
    }
  );
};

/* GET /movies/:movieid */
const moviesReadOne = (req, res) => {
  Movies
    .findById(req.params.movieid)
    .exec((err, movie) => {
      if (!movie) {
        return res
          .status(404)
          .json({
            "message": "movie not found" });
          } else if (err) {
            return res
                .status(404)
                .json(err);
          }
      res
        .status(200)
        .json(movie);
    });
  };

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne
};
