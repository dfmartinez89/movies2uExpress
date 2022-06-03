const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");
const geocoder = require("../utils/geocoder");
const asyncHandler = require("express-async-handler");

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/**
 * @desc Find review by id
 * @route GET movies/:movieid/reviews/:reviewid
 * @acces public */

const reviewsReadOne = asyncHandler(async (req, res) => {
  try {
    const movie = await Movies.findById(req.params.movieid).select(
      "title reviews"
    );
    if (!movie) {
      sendJSONresponse(res, 404, { message: "movie not found" });
    }
    if (movie.reviews && movie.reviews.length > 0) {
      const review = movie.reviews.id(req.params.reviewid);
      if (!review) {
        sendJSONresponse(res, 404, { message: "review not found" });
      } else {
        response = {
          movie: {
            title: movie.title,
            id: req.params.movieid,
          },
          review,
        };
        sendJSONresponse(res, 200, response);
      }
    } else {
      sendJSONresponse(res, 404, { message: "No reviews found" });
    }
  } catch (e) {
    sendJSONresponse(res, 400, e.message);
  }
});

/**
 * @desc Create new review
 * @route POST movies/:movieid/reviews/
 * @acces public */
const reviewsCreate = asyncHandler(async (req, res, next) => {
  if (!req.body.reviewLocation) {
    sendJSONresponse(res, 400, { message: "reviewLocation is required" });
  } else {
    try {
      const movie = await Movies.findById(req.params.movieid).select("reviews");
      doAddReview(req, res, movie);
    } catch (e) {
      res.status(400).json(e.message);
    }
  }
});

const doAddReview = async (req, res, movie) => {
  const loc = await geocoder.geocode(req.body.reviewLocation);
  const parseLocation = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedLocation: loc[0].formattedAddress,
  };
  if (!movie) {
    sendJSONresponse(res, 404, { message: "movie not found" });
  } else {
    movie.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      description: req.body.description,
      reviewGeoLocation: parseLocation,
    });

    movie.save((error, movie) => {
      //pre saving a movie middleware breaks here expecting a location on parent document
      if (error) {
        sendJSONresponse(res, 406, error.message);
      } else {
        updateAverageRating(movie._id);
        let thisReview = movie.reviews[movie.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

const updateAverageRating = asyncHandler(async (movieid) => {
  Movies.findById(movieid)
    .select("rating reviews")
    .exec((error, movie) => {
      if (!error) {
        doSetAverageRating(movie);
      }
    });
});

const doSetAverageRating = (movie) => {
  let i, reviewCount, ratingAverage, ratingTotal;
  if (movie.reviews && movie.reviews.length > 0) {
    reviewCount = movie.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + movie.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    movie.rating = ratingAverage;
    movie.save((error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

/**
 * @desc Update review
 * @route PUT movies/:movieid/reviews/:reviewid
 * @acces private */

const reviewsUpdateOne = asyncHandler(async (req, res) => {
  if (!req.body.reviewLocation) {
    sendJSONresponse(res, 400, { message: "reviewLocation is required" });
  } else {
    try {
      const loc = await geocoder.geocode(req.body.reviewLocation);
      const parseLocation = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedLocation: loc[0].formattedAddress,
      };
      const movie = await Movies.findById(req.params.movieid).select("reviews");
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movie not found" });
      }
      if (movie.reviews && movie.reviews.length > 0) {
        thisReview = movie.reviews.id(req.params.reviewid);
        if (!thisReview) {
          sendJSONresponse(res, 404, { message: "review not found" });
        } else {
          thisReview.author = req.body.author;
          thisReview.rating = req.body.rating;
          thisReview.description = req.body.description;
          thisReview.reviewGeoLocation = parseLocation;

          movie.save((error, movie) => {
            if (error) {
              sendJSONresponse(res, 400, error.message);
            } else {
              updateAverageRating(movie._id);
              sendJSONresponse(res, 200, thisReview);
            }
          });
        }
      } else {
        sendJSONresponse(res, 404, { message: "No review to update" });
      }
    } catch (e) {
      console.log(e);
    }
  }
});

/**
 * @desc Delete review
 * @route DELETE movies/:movieid/reviews/:reviewid
 * @acces private */
const reviewsDeleteOne = asyncHandler(async (req, res) => {
  if (!req.params.movieid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {
      message: "Not found, movieid and reviewid are both required",
    });
  }
  try {
    const movie = await Movies.findById(req.params.movieid).select("reviews");

    if (!movie) {
      sendJSONresponse(res, 404, { message: "movie not found" });
    }
    if (movie.reviews && movie.reviews.length > 0) {
      if (!movie.reviews.id(req.params.reviewid)) {
        sendJSONresponse(res, 404, { message: "review not found" });
      } else {
        movie.reviews.id(req.params.reviewid).remove();
        movie.save((err) => {
          if (err) {
            sendJSONresponse(res, 406, err._message);
          } else {
            updateAverageRating(movie._id);
            sendJSONresponse(res, 204, null);
          }
        });
      }
    } else {
      sendJSONresponse(res, 404, { message: "No review to delete" });
    }
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = {
  reviewsReadOne,
  reviewsCreate,
  reviewsUpdateOne,
  reviewsDeleteOne,
};
