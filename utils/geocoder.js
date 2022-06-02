const NodeGeocoder = require('node-geocoder');
require("dotenv/config");

const options = {
  provider: process.env.GEOCODER_PROVIDER,

  // Optional depending on the providers
  apiKey: process.env.MAPQQUEST_KEY, // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
