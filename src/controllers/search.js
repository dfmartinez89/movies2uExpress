/* eslint-disable no-prototype-builtins */
const mongoose = require('mongoose')
const Movies = mongoose.model('Movie')
const asyncHandler = require('express-async-handler')
require('dotenv/config')
const imdb = require('../utils/imdb')

const getImdbResponse = asyncHandler(async (criteria) => {
  const res = await fetch(imdb.imdbUrl(process.env.IMDB_KEY, criteria))
  if (!res.ok) {
    throw new Error('IMDB response was not successful')
  }
  const jsonData = await res.json()
  return jsonData
})

/* Search IMDb movies */
const findImdbMoviesBy = asyncHandler(async (req, res) => {
  if (!req.query.criteria) {
    return res.status(400).json({
      message: 'missing search criteria'
    })
  }
  const criteria = req.query.criteria
  const data = await getImdbResponse(criteria)
  return res.status(200).json(data)
})

/* Search movies */
const searchUtils = asyncHandler(async (req, res) => {
  const queryParams = req.query
  let parseYear
  // Find by title.
  if (queryParams.hasOwnProperty('title')) {
    try {
      const movies = await Movies.find({ title: { $regex: req.query.title } })
      if (movies.length === 0) {
        return res.status(404).json({
          success: true,
          count: movies.length,
          data: 'there are no movies with title ' + req.query.title
        })
      }
      return res.status(200).json({
        success: true,
        count: movies.length,
        data: movies
      })
    } catch (e) {
      console.log(e.message)
    }
    // Find by year
  } else if (queryParams.hasOwnProperty('year')) {
    if (isNaN(req.query.year)) {
      return res.status(422).json({
        message: 'request validation error'
      })
    } else {
      parseYear = req.query.year
    }
    try {
      const movies = await Movies.find({ year: parseYear })
      if (movies.length === 0) {
        return res.status(404).json({
          success: true,
          count: movies.length,
          data: 'there are no movies on the year ' + req.query.year
        })
      }
      return res.status(200).json({
        success: true,
        count: movies.length,
        data: movies
      })
    } catch (e) {
      console.log(e.message)
    }
    // Find by genre
  } else if (queryParams.hasOwnProperty('genre')) {
    try {
      const movies = await Movies.find({ genre: { $regex: req.query.genre } })
      if (movies.length === 0) {
        return res.status(404).json({
          success: true,
          count: movies.length,
          data: 'there are no movies with genre ' + req.query.genre
        })
      }
      return res.status(200).json({
        success: true,
        count: movies.length,
        data: movies
      })
    } catch (e) {
      console.log(e.message)
    }
  } else {
    return res.status(400).json({
      message: 'missing search criteria, use title, year or genre'
    })
  }
})

module.exports = { searchUtils, findImdbMoviesBy, getImdbResponse }
