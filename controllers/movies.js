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
  try {
    parseTitle = req.body.title.toString();
    parseYear = req.body.year;
    parseGenre = req.body.genre.toString();
    parsePoster = req.body.poster.toString();
    parseRating = req.body.rating;

  } catch (error) {
    sendJSONresponse(res, 422, error);
  }

  if (isNaN(parseYear) || isNaN(parseRating)) {
    sendJSONresponse(res, 422, "request validation error");
  }
  Movies.create(
    {
      title: parseTitle,
      year: parseYear,
      genre: parseGenre,
      poster: parsePoster,
      rating: parseRating,
    },
    (err, movie) => {
      if (err) {
        sendJSONresponse(res, 422, err);
      } else {
        sendJSONresponse(res, 201, movie);
      }
    }
  );
};

/* GET /movies/:movieid */
const moviesReadOne = (req, res) => {
  Movies.findById(req.params.movieid).exec((err, movie) => {
    if (!movie) {
      return res.status(404).json({
        message: "movie not found",
      });
    } else if (err) {
      return res.status(404).json(err);
    }
    res.status(200).json(movie);
  });
};

/* PUT /movies/:moviesid */
const moviesUpdateOne = (req, res) => {
  if (!req.params.movieid) {
    sendJSONresponse(res, 404, { message: "Not found, movieid is required" });
  }
  Movies.findOneAndUpdate({ id: req.params.movieid }, { new: true }).exec(
    (err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movieid not found" });
      } else if (err) {
        sendJSONresponse(res, 400, err);
      }
      movie.title = req.body.title;
      movie.year = req.body.year;
      movie.genre = req.body.genre;
      movie.poster = req.body.poster;
      movie.poster = req.body.poster;
      //not updating reviews via this endpoint1
      movie.save((err, movie) => {
        if (err) {
          sendJSONresponse(res, 404, err);
        } else {
          sendJSONresponse(res, 200, movie);
        }
      });
    }
  );
};

/* DELETE movies/:movieid */
const moviesDeleteOne = (req, res) => {
  const movieid = req.params.movieid;
  if (movieid) {
    Movies
      .findByIdAndRemove(movieid)
      .exec((err, movieid) => {
          if (err) {
            sendJSONresponse(res, 404, err);
          }
          console.log("movie id " + movieid + " deleted");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, {"message": "No movieid"});
  }
};

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne
};
