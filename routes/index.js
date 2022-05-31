var express = require("express");
var router = express.Router();
const ctrlSearch = require("../controllers/search");

/* GET home page */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Search movies */
router.get("/search", ctrlSearch.searchUtils);
router.get("/imdb", ctrlSearch.findImdbMoviesBy);

module.exports = router;
