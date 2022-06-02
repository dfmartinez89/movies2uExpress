const mongoose = require("mongoose");
const geocoder = require("../utils/geocoder");

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true, min: 3, max: 60 },
  rating: { type: Number, required: true, min: 0, max: 5 },
  description: { type: String, required: false, min: 3, max: 260 },
  reviewLocation: { type: String},
  // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
  reviewGeoLocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedLocation: String,
  },
  createdAt: { type: Date, default: Date.now },
});

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  year: { type: Number, min: 1900, max: 2022 },
  genre: { type: String, required: false, min: 1, max: 10 },
  poster: { type: String, required: false, min: 12, max: 80 },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  location: {type: String},
  // Note that longitude comes first in a GeoJSON coordinate array, not latitude.
  geoLocation: {
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ["Point"], // 'location.type' must be 'Point'
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedLocation: String,
  },
  createdAt: { type: Date, default: Date.now },
  reviews: [reviewSchema],
});

/* Middleware to obtain geolocation (fails when posting a review because it triggers this pre save without passing a location)
//At creating movie
movieSchema.pre("save", async function (next) {
  if (this.location) {
    const loc = await geocoder.geocode(this.location);
    this.geoLocation = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedLocation: loc[0].formattedAddress,
    };
    //Do not save location from request
    this.location = undefined;
  }

  next();
});

//At updating movie
movieSchema.pre("findOneAndUpdate", async function (next) {
  if (this.location) {
    const loc = await geocoder.geocode(this.location);
    this.geoLocation = {
      type: "Point",
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedLocation: loc[0].formattedAddress,
    };
    //Do not save location from request
    this.location = undefined;
  }
  next();
});

//At creating review
reviewSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.reviewLocation);
  this.geoLocation = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedLocation: loc[0].formattedAddress,
  };
  //Do not save location from request
  this.reviewLocation = undefined;
  next();
});

//At updating review
reviewSchema.pre("findOneAndUpdate", async function (next) {
  const loc = await geocoder.geocode(this.reviewLocation);
  this.geoLocation = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedLocation: loc[0].formattedAddress,
  };
  //Do not save location from request
  this.reviewLocation = undefined;
  next();
});*/

module.exports = mongoose.model("Movie", movieSchema);
