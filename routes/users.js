const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser } = require("../controllers/users");
const { protect } = require("../middleware/auth");

/* Create user */
router.post("/", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getUser);

module.exports = router;
