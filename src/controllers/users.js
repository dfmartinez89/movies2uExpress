require('dotenv/config')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/users')
const asyncHandler = require('express-async-handler')

/**
 * @desc Register user
 * @route POST /users
 * @acces public */
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide all required fields'
    })
  }
  try {
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({
        message: 'User already exists'
      })
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    const user = await User.create({ email, password: hashedPassword })
    return res.status(201).json({
      _id: user.id,
      email: user.email,
      token: genToken(user._id)
    })
  } catch (e) {
    return res.status(406).json({
      message: e.message
    })
  }
})

/**
 * @desc Login new user
 * @route POST /users/login
 * @acces public */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({
      message: 'Please provide all required fields'
    })
  }
  try {
    const user = await User.findOne({ email })
    if (user && (await bcrypt.compare(password, user.password))) {
      res.status(200).json({
        success: true,
        _id: user.id,
        email: user.email,
        token: genToken(user._id)
      })
    } else {
      return res.status(403).json({
        message: 'Invalid email or password'
      })
    }
  } catch (error) {
    return res.status(406).json({
      message: error.message
    })
  }
})

/**
 * @desc Get logged user data
 * @route GET /users/me
 * @acces private */
const getUser = asyncHandler(async (req, res) => {
  // Grab id user from request available thanks to middleware
  const { _id, email } = await User.findById(req.user.id)
  res.status(200).json({
    id: _id,
    email
  })
})

/**
 * Generate JWT
 */
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

module.exports = { registerUser, loginUser, getUser, genToken }
