const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const connectDB = require("./db");

const dotenv = require("dotenv");
dotenv.config();

const indexRouter = require("./routes/index");
const moviesRouter = require("./routes/movies");

connectDB();
const app = express();

const PORT = process.env.PORT;

if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/movies", moviesRouter);
app.disable("x-powered-by"); //security fix
console.log(`Server running in ${process.env.NODE_ENV} mode on ${PORT}`);
module.exports = app;
