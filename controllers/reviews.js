const mongoose = require("mongoose");
const Movies = mongoose.model("Movie");

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* GET /movies/:movieid/reviews*/
const reviewsReadAll = (req, res) => {
  parseId = req.params.movieid.toString();
  Movies.findById(parseId)
    .select("title reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movieid not found" });
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
  parsemovieId = req.params.movieid.toString();
  parsereviewId = req.params.reviewid.toString();
  Movies.findById(parsemovieId)
    .select("title reviews")
    .exec((err, movie) => {
      if (!movie) {
        sendJSONresponse(res, 404, { message: "movieid not found" });
      } else if (err) {
        sendJSONresponse(res, 400, err);
      }
      if (movie.reviews && movie.reviews.length > 0) {
        const review = movie.reviews.id(parsereviewId);
        if (!review) {
          sendJSONresponse(res, 404, { message: "reviewid not found" });
        } else {
          response = {
            movie: {
              title: movie.title,
              id: req.params.parseId,
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
//https://bobbyhadz.com/blog/javascript-error-cannot-set-headers-after-they-are-sent-to-client#:~:text=The%20%22Cannot%20set%20headers%20after,single%20response%20for%20each%20request.
const reviewsCreate = (req, res) => {
  parseMovieId = req.params.movieid.toString();
  parseAuthor = req.body.author.toString();
  parseRating = req.body.rating;
  parseDescription = req.body.description.toString();
  if (isNaN(parseRating)) {
    sendJSONresponse(res, 422, "request validation error" + error.message);
  }
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
    sendJSONresponse(res, 404, { message: "movieid not found" });
  }
};

const doAddReview = (req, res, movie) => {
  if (!movie) {
    sendJSONresponse(res, 404, { message: "movieid not found" });
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

module.exports = {
  reviewsReadAll,
  reviewsReadOne,
  reviewsCreate,
};
