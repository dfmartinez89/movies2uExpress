const mongoose = require('mongoose');
const Loc = mongoose.model('Location');

const sendJSONresponse = (res, status, content) => {
  res.status(status);
  res.json(content);
};

/* GET api/locations */
const locationsReadAll = (req, res) => {
  Loc
    .find({})
    .exec((err, locations) => {
        if (!locations) {
          sendJSONresponse(res, 404, {"message" : "locations not found"});
        } else if (err) { sendJSONresponse(res, 404, err);  }
        else { 
          sendJSONresponse(res, 200, locations);
        }
  });     
};

/* POST api/locations */
const locationsCreate = (req, res) => {
  Loc.create({
    name: req.body.name,
    address: req.body.address,
    facilities: req.body.facilities.split(","),
    distance: req.body.distance,
    coords: [parseFloat(req.body.lng), parseFloat(req.body.lat)],
    openingTimes: [{
      days: req.body.days1,
      opening: req.body.opening1,
      closing: req.body.closing1,
      closed: req.body.closed1,
    }, {
      days: req.body.days2,
      opening: req.body.opening2,
      closing: req.body.closing2,
      closed: req.body.closed2,
    }]
    }, (err, location) => {
          if (err) { sendJSONresponse(res, 404, err); } else 
                  { sendJSONresponse(res, 201, location); } 
    });
};

/* GET api/locations/locationid */
const locationsReadOne = (req, res) => {
  Loc
    .findById(req.params.locationid)
    .exec((err, location) => {
      if (!location) {
        return res
          .status(404)
          .json({
            "message": "location not found" });
          } else if (err) {
            return res
                .status(404)
                .json(err);
          }
      res
        .status(200)
        .json(location);
    });
  };



/* PUT api/locations/:locationid */
const locationsUpdateOne = (req, res) => {
  if (!req.params.locationid) {
    sendJSONresponse(res, 404, {"message": "Not found, locationid is required"});
  }
  Loc
    .findById(req.params.locationid)
    .select('-reviews -rating')
    .exec((err, location) => {
          if (!location) {
              sendJSONresponse(res, 404, {"message": "locationid not found"});
            } else if (err) {
                sendJSONresponse(res, 400, err);
              }
        location.name = req.body.name;
        location.address = req.body.address;
        location.facilities = req.body.facilities.split(",");
        location.coords = {
          type : 'Point', 
          coordinates: [parseFloat(req.body.lng), parseFloat(req.body.lat)]
        },
        location.openingTimes = [{
          days: req.body.days1,
          opening: req.body.opening1,
          closing: req.body.closing1,
          closed: req.body.closed1,
        }, {
          days: req.body.days2,
          opening: req.body.opening2,
          closing: req.body.closing2,
          closed: req.body.closed2,
        }];
        location.save((err, location) => {
          if (err) {
            sendJSONresponse(res, 404, err);
          } else {
            sendJSONresponse(res, 200, location);
          }
        });
      }); 
};

/* DELETE /api/locations/:locationid */
const locationsDeleteOne = (req, res) => {
  const locationid = req.params.locationid;
  if (locationid) {
    Loc
      .findByIdAndRemove(locationid)
      .exec((err, location) => {
          if (err) {
            sendJSONresponse(res, 404, err);
          }
          console.log("Location id " + locationid + " deleted");
          sendJSONresponse(res, 204, null);
        }
    );
  } else {
    sendJSONresponse(res, 404, {"message": "No locationid"});
  }
};


module.exports = {
  locationsReadAll,
  locationsCreate,
  locationsReadOne,
  locationsUpdateOne,
  locationsDeleteOne
};