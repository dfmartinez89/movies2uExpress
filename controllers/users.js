require("dotenv/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const asyncHandler = require("express-async-handler");

/**
 * @desc Register user
 * @route POST /users
 * @acces public */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please add all required fields");
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashedPassword });
  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: genToken(user._id),
    });
  } else {
    res.status(406);
    throw new Error("Invalid user data");
  }
});

/**
 * @desc Login new user
 * @route POST /users/login
 * @acces public */
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: genToken(user._id),
    });
  } else {
    res.status(403);
    throw new Error("Invalid credentials");
  }
});

/**
 * @desc Get logged user data
 * @route GET /users/me
 * @acces private */
const getUser = asyncHandler(async (req, res) => {
  //Grab id user from request available thanks to middleware
  const { _id, name, email } = await User.findById(req.user.id);
  res.status(200).json({
    id: _id,
    name,
    email,
  });
});

/**
 * Generate JWT
 */
const genToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = { registerUser, loginUser, getUser };
