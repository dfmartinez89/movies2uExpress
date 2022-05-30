const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* GET api/movies */
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

/* POST api/movies */
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

module.exports = {
  moviesFindAll,
  moviesCreate,
};
