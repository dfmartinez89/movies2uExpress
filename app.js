require("dotenv/config");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const connectDB = require("./db");
const cors = require('cors');

/* Middleware */
const indexRouter = require("./routes/index");
const moviesRouter = require("./routes/movies");
//Enable cors
app.use(cors());

//Connect database
connectDB();

//Enable logging in dev enviroment
if (process.env.NODE_ENV === "development") {
  app.use(logger("dev"));
}
 //Body parser
app.use(express.json());

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/movies", moviesRouter);
app.disable("x-powered-by"); //security fix
console.log(`Server running in ${process.env.NODE_ENV} mode on ${process.env.PORT}`);
module.exports = app;
