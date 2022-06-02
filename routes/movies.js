const express = require('express');
const router = express.Router();
const ctrlMovies = require('../controllers/movies');
const ctrlReviews = require('../controllers/reviews');

// Movies 
router.get('/', ctrlMovies.moviesFindAll);
router.post('/', ctrlMovies.moviesCreate);
router.get('/:movieid', ctrlMovies.moviesReadOne);
router.put('/:movieid', ctrlMovies.moviesUpdateOne);
router.delete('/:movieid', ctrlMovies.moviesDeleteOne);

// Reviews
router.post('/:movieid/reviews', ctrlReviews.reviewsCreate);
router.get('/:movieid/reviews/:reviewid', ctrlReviews.reviewsReadOne);
router.put('/:movieid/reviews/:reviewid', ctrlReviews.reviewsUpdateOne);
router.delete('/:movieid/reviews/:reviewid', ctrlReviews.reviewsDeleteOne);

module.exports = router;
