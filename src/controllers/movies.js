require('dotenv/config')
const Movies = require('../models/movies')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('express-async-handler')

/**
 * @desc List movies
 * @route GET /movies
 * @acces public */
const moviesFindAll = asyncHandler(async (req, res) => {
  try {
    const movies = await Movies.find()
    return res.status(200).json({
      success: true,
      count: movies.length,
      data: movies
    })
  } catch (e) {
    res.status(500).json({
      message: e.message
    })
  }
})

/**
 * @desc Find movie by id
 * @route GET /movies/:movieid
 * @acces public */
const moviesReadOne = asyncHandler(async (req, res) => {
  if (!req.params.movieid) {
    return res.status(400).json({
      message: 'Movieid is required'
    })
  }
  try {
    const movie = await Movies.findById(req.params.movieid)
    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }
    return res.status(200).json({
      success: true,
      data: movie
    })
  } catch (e) {
    res.status(400).json({
      message: e.message
    })
  }
})

/**
 * @desc Insert new movie
 * @route POST /movies
 * @acces private */
const moviesCreate = asyncHandler(async (req, res) => {
  if (!req.body.location) {
    return res.status(400).json({
      message: 'Location is required'
    })
  }
  try {
    const loc = await geocoder.geocode(req.body.location)
    const parseLocation = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedLocation: loc[0].formattedAddress
    }
    const movie = await Movies.create({
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      poster: req.body.poster,
      rating: req.body.rating,
      geoLocation: parseLocation
    })
    return res.status(201).json({
      success: true,
      data: movie
    })
  } catch (e) {
    return res.status(406).json({ message: e.message })
  }
})

/**
 * @desc Update movie
 * @route PUT /movies/:moviesid
 * @acces private */
const moviesUpdateOne = asyncHandler(async (req, res) => {
  if (!req.body.location) {
    return res.status(400).json({
      message: 'Location is required'
    })
  }
  try {
    const loc = await geocoder.geocode(req.body.location)
    const parseLocation = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedLocation: loc[0].formattedAddress
    }
    const movie = await Movies.findOneAndUpdate({
      _id: req.params.movieid
    },
    {
      title: req.body.title,
      year: req.body.year,
      genre: req.body.genre,
      rating: req.body.rating,
      geoLocation: parseLocation
    },
    { new: true })
    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }
    // not updating reviews via this endpoint
    // await movie.save(movie)
    return res.status(200).json({
      success: true,
      data: movie
    })
  } catch (e) {
    return res.status(406).json({ message: e.message })
  }
})

/**
 * @desc Delete movie
 * @route DELETE movies/:movieid
 * @acces private */
const moviesDeleteOne = asyncHandler(async (req, res) => {
  try {
    const movie = await Movies.findByIdAndRemove(req.params.movieid)
    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }
    return res.status(204).json({
      success: true,
      movieid: req.params.movieid
    })
  } catch (e) {
    return res.status(406).json({ message: e.message })
  }
})

module.exports = {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne
}
