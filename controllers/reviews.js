const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

const sendJSONresponse = (res, status, content) => {
  res.status(status).json(content);
};

/* GET /movies/:movieid/reviews*/
//https://bobbyhadz.com/blog/javascript-error-cannot-set-headers-after-they-are-sent-to-client#:~:text=The%20%22Cannot%20set%20headers%20after,single%20response%20for%20each%20request.
const reviewsReadAll = (req, res) => {
  const parseId = String(req.params.movieid);
  Movies.findById(parseId)
    .select("title reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movie not found" });
      } else if (err) {
        sendJSONresponse(res, 400, err);
      }
      if (movie.reviews && movie.reviews.length > 0) {
        const reviews = movie.reviews;
        response = {
          movie: {
            title: movie.title,
            id: parseId,
          },
          reviews,
        };
        sendJSONresponse(res, 200, response);
      }
      sendJSONresponse(res, 404, { message: "No reviews found" });
    });
};

/* GET /movies/:movieid/reviews/:reviewid */
const reviewsReadOne = (req, res) => {
  const parsemovieId = String(req.params.movieid);
  const parsereviewId = String(req.params.reviewid);

  Movies.findById(parsemovieId)
    .select("title reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movie not found" });
      } else if (err) {
        sendJSONresponse(res, 400, err);
      }
      if (movie.reviews && movie.reviews.length > 0) {
        const review = movie.reviews.id(parsereviewId);
        if (!review) {
          sendJSONresponse(res, 404, { message: "review not found" });
        } else {
          response = {
            movie: {
              title: movie.title,
              id: req.params.parsemovieId,
            },
            review,
          };
          sendJSONresponse(res, 200, response);
        }
      } else {
        sendJSONresponse(res, 404, { message: "No reviews found" });
      }
    });
};

/* POST /movies/:movieid/reviews */
const reviewsCreate = (req, res) => {
  const parseMovieId = String(req.params.movieid);

  if (parseMovieId) {
    Movies.findById(parseMovieId)
      .select("reviews")
      .exec((err, movie) => {
        if (err) {
          sendJSONresponse(res, 400, err);
        } else {
          doAddReview(req, res, movie);
        }
      });
  } else {
    sendJSONresponse(res, 404, { message: "movie not found" });
  }
};

const doAddReview = (req, res, movie) => {
  const parseAuthor = String(req.body.author);
  const parseRating = req.body.rating;
  const parseDescription = String(req.body.description);
  if (!movie) {
    sendJSONresponse(res, 404, { message: "movie not found" });
  } else {
    movie.reviews.push({
      author: parseAuthor,
      rating: parseRating,
      description: parseDescription,
    });
    movie.save((err, movie) => {
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        updateAverageRating(movie._id);
        let thisReview = movie.reviews[movie.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

const updateAverageRating = (parseMovieId) => {
  Movies.findById(parseMovieId)
    .select("rating reviews")
    .exec((err, movie) => {
      if (!err) {
        doSetAverageRating(movie);
      }
    });
};

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
    movie.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

/* PUT /movies/:movieid/reviews/:reviewid */
const reviewsUpdateOne = (req, res) => {
  if (!req.params.movieid || !req.params.reviewid) {
    sendJSONresponse(res, 422, "request validation error");
  }
  const parseMovieId = String(req.params.movieid);
  const parseReviewId = String(req.params.reviewid);
  const parseAuthor = String(req.body.author);
  const parseRating = req.body.rating;
  const parseDescription = String(req.body.description);

  Movies.findById(parseMovieId)
    .select("reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movie not found" });
      } else if (err) {
        sendJSONresponse(res, 400, err);
      }
      if (movie.reviews && movie.reviews.length > 0) {
        thisReview = movie.reviews.id(parseReviewId);
        if (!thisReview) {
          sendJSONresponse(res, 404, { message: "review not found" });
        } else {
          thisReview.author = parseAuthor;
          thisReview.rating = parseRating;
          thisReview.description = parseDescription;
          movie.save((err, movie) => {
            if (err) {
              sendJSONresponse(res, 404, err);
            } else {
              updateAverageRating(movie._id);
              sendJSONresponse(res, 200, thisReview);
            }
          });
        }
      } else {
        sendJSONresponse(res, 404, { message: "No review to update" });
      }
    });
};

/* DELETE movies/:movieid/reviews/:reviewid */
const reviewsDeleteOne = (req, res) => {
  const parseMovieId = String(req.params.movieid);
  const parseReviewId = String(req.params.reviewid);

  if (!parseMovieId || !parseReviewId) {
    sendJSONresponse(res, 404, {
      message: "Not found, movieid and reviewid are both required",
    });
  }
  Movies.findById(parseMovieId)
    .select("reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movie not found" });
      } else if (err) {
        sendJSONresponse(res, 406, err._message);
      }
      if (movie.reviews && movie.reviews.length > 0) {
        if (!movie.reviews.id(parseReviewId)) {
          sendJSONresponse(res, 404, { message: "review not found" });
        } else {
          movie.reviews.id(parseReviewId).remove();
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
    });
};

module.exports = {
  reviewsReadAll,
  reviewsReadOne,
  reviewsCreate,
  reviewsUpdateOne,
  reviewsDeleteOne,
};
