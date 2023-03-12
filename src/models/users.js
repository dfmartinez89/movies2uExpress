const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    minLength: 6,
    maxLength: 255,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minLength: 6,
    maxLength: 1024
  },
  date: { type: Date, default: Date.now }
})
module.exports = mongoose.model('User', userSchema)
