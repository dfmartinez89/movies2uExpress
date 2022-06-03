const express = require("express");
const router = express.Router();
const { searchUtils, findImdbMoviesBy } = require("../controllers/search");

/* GET home page */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Search movies */
router.get("/search", searchUtils);
router.get("/imdb", findImdbMoviesBy);

module.exports = router;
