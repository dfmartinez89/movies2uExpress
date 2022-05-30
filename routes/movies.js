const express = require('express');
const router = express.Router();
const ctrlMovies = require('../controllers/movies');

// Movies 
router.get('/', ctrlMovies.moviesFindAll);
router.post('/', ctrlMovies.moviesCreate);
router.get('/:movieid', ctrlMovies.moviesReadOne);
router.put('/:movieid', ctrlMovies.moviesUpdateOne);
router.delete('/:movieid', ctrlMovies.moviesDeleteOne);


module.exports = router;
