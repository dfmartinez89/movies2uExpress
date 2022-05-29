var express = require("express");
var router = express.Router();

const movies = [
  {
    title: "Coconuts",
    year: 2018,
    genre: "Animation",
    poster:
      "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
    score: 5,
  },
  {
    title: "Matrix",
    year: 2021,
    genre: "Sci-FI",
    poster:
      "https://m.media-amazon.com/images/M/MV5BMGJkNDJlZWUtOGM1Ny00YjNkLThiM2QtY2ZjMzQxMTIxNWNmXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg",
    score: 4,
  },
];

/* GET movies listing. */
router.get("/", function (req, res, next) {
  res.json(movies);
});

module.exports = router;
