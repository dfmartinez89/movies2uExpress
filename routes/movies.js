const express = require('express');
const router = express.Router();
const ctrlMovies = require('../controllers/movies');

// Movies 
router.get('/', ctrlMovies.moviesFindAll);
router.post('/', ctrlMovies.moviesCreate);
router.get('/:movieid', ctrlMovies.moviesReadOne);
// router.put('/movies/:movieid', ctrlMovies.MoviesUpdateOne);
// router.delete('/movies/:movieid', ctrlMovies.MoviesDeleteOne);


module.exports = router;
