const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please add an email"],
    min: 255,
    max: 6,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    min: 6,
    max: 1024,
  },
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", userSchema);
