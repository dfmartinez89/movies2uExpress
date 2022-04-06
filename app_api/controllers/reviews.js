var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* POST a new review, providing a locationid */
/* /api/locations/:locationid/reviews */
const reviewsCreate = (req, res) => {
  const locationId = req.params.locationid;
  if (locationId) {
    Loc
      .findById(locationId)
      .select('reviews')
      .exec((err, location) => {
          if (err) {
            sendJSONresponse(res, 400, err);
          } else {
            doAddReview(req, res, location);
          }
        }
    );
  } else {
    sendJSONresponse(res, 404, {"message": "Locationid not found"});
  }
};

const doAddReview = (req, res, location) => {
  if (!location) {
    sendJSONresponse(res, 404, {"message" : "Locationid not found"});
  } else {
    location.reviews.push({
      author: req.body.author,
      rating: req.body.rating,
      reviewText: req.body.reviewText
    });
    location.save((err, location) => {
      if (err) {
        sendJSONresponse(res, 400, err);
      } else {
        updateAverageRating(location._id);
        let thisReview = location.reviews[location.reviews.length - 1];
        sendJSONresponse(res, 201, thisReview);
      }
    });
  }
};

const updateAverageRating = (locationid) => {
  Loc
    .findById(locationid)
    .select('rating reviews')
    .exec((err, location) => {
        if (!err) {
          doSetAverageRating(location);
        }
      });
};

const doSetAverageRating = (location) => {
  let i, reviewCount, ratingAverage, ratingTotal;
  if (location.reviews && location.reviews.length > 0) {
    reviewCount = location.reviews.length;
    ratingTotal = 0;
    for (i = 0; i < reviewCount; i++) {
      ratingTotal = ratingTotal + location.reviews[i].rating;
    }
    ratingAverage = parseInt(ratingTotal / reviewCount, 10);
    location.rating = ratingAverage;
    location.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Average rating updated to", ratingAverage);
      }
    });
  }
};

/* GET /locations/:locationid/reviews/:reviewid */
const reviewsReadOne = (req, res) => {
    Loc
      .findById(req.params.locationid)
      .select('name reviews')
      .exec((err, location) => {
          if (!location) {
            sendJSONresponse(res, 404, {"message": "locationid not found"});
          } else if (err) {
            sendJSONresponse(res, 400, err);
          }
          if (location.reviews && location.reviews.length > 0) {
            const review = location.reviews.id(req.params.reviewid);
            if (!review) {
              sendJSONresponse(res, 404, {"message": "reviewid not found"});
            } else {
              response = {
                location: {
                  name: location.name,
                  id: req.params.locationid
                },
                review
              };
              sendJSONresponse(res, 200, response);
            }
          } else {
            sendJSONresponse(res, 404, {"message": "No reviews found"});
          }
        });
};

/* PUT /api/locations/:locationid/reviews/:reviewid */
const reviewsUpdateOne = (req, res) => {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
        if (!location) {
          sendJSONresponse(res, 404, {"message": "location not found"});
        } else if (err) {
          sendJSONresponse(res, 400, err);
        }
        if (location.reviews && location.reviews.length > 0) {
          thisReview = location.reviews.id(req.params.reviewid);
          if (!thisReview) {
            sendJSONresponse(res, 404, {"message": "reviewid not found"});
          } else {
            thisReview.author = req.body.author;
            thisReview.rating = req.body.rating;
            thisReview.reviewText = req.body.reviewText;
            location.save((err, location) => {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 200, thisReview);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {"message": "No review to update"});
        }
      });
};

/* DELETE /api/locations/:locationid/reviews/:reviewid */
const reviewsDeleteOne = (req, res) => {
  if (!req.params.locationid || !req.params.reviewid) {
    sendJSONresponse(res, 404, {"message": "Not found, locationid and reviewid are both required"});
  }
  Loc
    .findById(req.params.locationid)
    .select('reviews')
    .exec((err, location) => {
        if (!location) {
          sendJSONresponse(res, 404, {"message": "locationid not found"});
        } else if (err) {
          sendJSONresponse(res, 400, err);
        }
        if (location.reviews && location.reviews.length > 0) {
          if (!location.reviews.id(req.params.reviewid)) {
            sendJSONresponse(res, 404, {"message": "reviewid not found"});
          } else {
            location.reviews.id(req.params.reviewid).remove();
            location.save((err) => {
              if (err) {
                sendJSONresponse(res, 404, err);
              } else {
                updateAverageRating(location._id);
                sendJSONresponse(res, 204, null);
              }
            });
          }
        } else {
          sendJSONresponse(res, 404, {"message": "No review to delete"});
        }
      }
  );
};

module.exports = {
  reviewsCreate,
  reviewsUpdateOne,
  reviewsReadOne,
  reviewsDeleteOne 
};
