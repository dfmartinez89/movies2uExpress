require("dotenv/config");
const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const connectDB = require("./middleware/db");
const cors = require("cors");
const { errorHandler } = require("./middleware/errorHandler");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");

/* Swagger */
const swaggerOptions = {
  swaggerDefinition: {
    openapi:"3.0.0",
    info: {
      title: "Movies API",
      version: "0.1.0",
      description:
        "API with required functionality for UAL's signature final proyect",
      contact: {
        name: "Damian Ferro",
        url: "https://github.com/thywillbedone/movies2uExpress",
        email: "dfm354@inlumine.ual.es",
      },
    },
    servers: [
      { url: "http://localhost:3000", description: "Dev server" },
      { url: "https://movies2uexpress-xqmie7qm3a-uc.a.run.app", description: "Prod server" },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

/* Middleware */
const indexRouter = require("./routes/index");
const moviesRouter = require("./routes/movies");
const usersRouter = require("./routes/users");

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
app.use("/users", usersRouter);

app.use(errorHandler);

app.disable("x-powered-by"); //security fix
console.log(
  `Server running in ${process.env.NODE_ENV} mode on ${process.env.PORT}`
);
module.exports = app;
