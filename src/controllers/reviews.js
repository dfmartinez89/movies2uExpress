const mongoose = require('mongoose')
const Movies = mongoose.model('Movie')
const geocoder = require('../utils/geocoder')
const asyncHandler = require('express-async-handler')

/**
 * @desc Find review by id
 * @route GET movies/:movieid/reviews/:reviewid
 * @acces public */

const reviewsReadOne = asyncHandler(async (req, res) => {
  try {
    const movie = await Movies.findById(req.params.movieid).select(
      'title reviews')

    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }

    if (!movie.reviews || movie.reviews.length === 0) {
      return res.status(404).json({
        message: 'No reviews found'
      })
    }

    const review = movie.reviews.id(req.params.reviewid)
    if (!review) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }

    return res.status(200).json({
      movie: {
        title: movie.title,
        id: req.params.movieid,
        review
      }

    })
  } catch (e) {
    return res.status(400).json({
      message: e.message
    })
  }
})

/**
 * @desc Create new review
 * @route POST movies/:movieid/reviews/
 * @acces public */
const reviewsCreate = asyncHandler(async (req, res, next) => {
  if (!req.body.reviewLocation) {
    return res.status(400).json({
      message: 'reviewLocation is required'
    })
  }
  try {
    const movie = await Movies.findById(req.params.movieid).select('reviews')
    await doAddReview(req, res, movie)
  } catch (e) {
    res.status(400).json({ message: e.message })
  }
})

const doAddReview = async (req, res, movie) => {
  const loc = await geocoder.geocode(req.body.reviewLocation)
  const parseLocation = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedLocation: loc[0].formattedAddress
  }
  if (!movie) {
    return res.status(404).json({
      message: 'Movie not found'
    })
  }
  try {
    movie.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      description: req.body.description,
      reviewGeoLocation: parseLocation
    })

    await movie.save(movie)
    await updateAverageRating(movie._id)
    const thisReview = movie.reviews[movie.reviews.length - 1]
    return res.status(201).json({
      success: true,
      data: thisReview
    })
  } catch (error) {
    res.status(406).json(error.message)
  }
}

const updateAverageRating = asyncHandler(async (movieid) => {
  Movies.findById(movieid)
    .select('rating reviews')
    .exec((error, movie) => {
      if (!error) {
        doSetAverageRating(movie)
      }
    })
})

const doSetAverageRating = (movie) => {
  let i, reviewCount, ratingAverage, ratingTotal
  if (movie.reviews && movie.reviews.length > 0) {
    reviewCount = movie.reviews.length
    ratingTotal = 0
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + movie.reviews[i].rating
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10)
    movie.rating = ratingAverage
    movie.save((error) => {
      if (!error) {
        console.log('Average rating updated to', ratingAverage)
      }
      console.log(error)
    })
  }
}

/**
 * @desc Update review
 * @route PUT movies/:movieid/reviews/:reviewid
 * @acces private */

const reviewsUpdateOne = asyncHandler(async (req, res) => {
  if (!req.body.reviewLocation) {
    return res.status(400).json({
      message: 'reviewLocation is required'
    })
  }
  try {
    const loc = await geocoder.geocode(req.body.reviewLocation)
    const parseLocation = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedLocation: loc[0].formattedAddress
    }
    const movie = await Movies.findById(req.params.movieid).select('reviews')
    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }
    if (!movie.reviews || movie.reviews.length === 0) {
      return res.status(404).json({
        message: 'No review to update'
      })
    }
    const thisReview = movie.reviews.id(req.params.reviewid)
    if (!thisReview) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }
    thisReview.author = req.body.author
    thisReview.rating = req.body.rating
    thisReview.description = req.body.description
    thisReview.reviewGeoLocation = parseLocation
    await movie.save()
    await updateAverageRating(movie._id)
    return res.status(201).json({
      success: true,
      data: thisReview
    })
  } catch (e) {
    return res.status(406).json({
      message: e.message
    })
  }
})

/**
 * @desc Delete review
 * @route DELETE movies/:movieid/reviews/:reviewid
 * @acces private */
const reviewsDeleteOne = asyncHandler(async (req, res) => {
  if (!req.params.movieid || !req.params.reviewid) {
    return res.status(400).json({
      message: 'Not found, movieid and reviewid are both required'
    })
  }
  try {
    const movie = await Movies.findById(req.params.movieid).select('reviews')
    if (!movie) {
      return res.status(404).json({
        message: 'Movie not found'
      })
    }
    if (!movie.reviews || movie.reviews.length === 0) {
      return res.status(404).json({
        message: 'No review to delete'
      })
    }
    if (!movie.reviews.id(req.params.reviewid)) {
      return res.status(404).json({
        message: 'Review not found'
      })
    }
    movie.reviews.id(req.params.reviewid).remove()
    await movie.save()
    await updateAverageRating(movie._id)
    return res.status(204).json({
      success: true
    })
  } catch (e) {
    return res.status(406).json({
      message: e.message
    })
  }
})

module.exports = {
  reviewsReadOne,
  reviewsCreate,
  reviewsUpdateOne,
  reviewsDeleteOne,
  doAddReview,
  updateAverageRating,
  doSetAverageRating
}
