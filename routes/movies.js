const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne,
} = require("../controllers/movies");
const {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne,
} = require("../controllers/reviews");

// Movies
router.get("/", moviesFindAll);
router.post("/", protect, moviesCreate);
router.get("/:movieid", moviesReadOne);
router.put("/:movieid", protect, moviesUpdateOne);
router.delete("/:movieid", protect, moviesDeleteOne);

// Reviews
router.post("/:movieid/reviews", reviewsCreate);
router.get("/:movieid/reviews/:reviewid", reviewsReadOne);
router.put("/:movieid/reviews/:reviewid", protect, reviewsUpdateOne);
router.delete("/:movieid/reviews/:reviewid", protect, reviewsDeleteOne);

module.exports = router;
