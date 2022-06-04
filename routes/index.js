const express = require("express");
const router = express.Router();
const { searchUtils, findImdbMoviesBy } = require("../controllers/search");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
 *     responses:
 *       UnauthorizedError:
 *         description: Access token is missing or invalid
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - location
 *       properties:
 *         title:
 *           type: string
 *           description: The movie title
 *         year:
 *           type: number
 *           description: The movie year of release
 *         genre:
 *           type: string
 *           description: The movie genre
 *         poster:
 *           type: string
 *           description: The movie url to poster image
 *         rating:
 *           type: number
 *           description: The movie rating average
 *         location:
 *           type: string
 *           description: Location of the point of movie creation in our db
 *     Review:
 *       type: object
 *       required:
 *         - author
 *         - rating
 *         - reviewLocation
 *       properties:
 *         author:
 *           type: string
 *           description: The review author
 *         rating:
 *           type: number
 *           description: The review rating for the movie
 *         description:
 *           type: string
 *           description: The review description
 *         reviewLocation:
 *           type: string
 *           description: Location of the point of movie creation in our db
 */

/* GET home page */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

/* Search movies */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Finds movies by title, year or genre
 *     tags: [movies]
 *     parameters:
 *       - in: query
 *         name: title
 *         schema:
 *           type: string
 *         required: false
 *         description: The title to search movies for
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *         required: false
 *         description: The year to search movies for
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         required: false
 *         description: The genre to search movies for
 *     responses:
 *       200:
 *         description: Movie details
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: movie not found
 *       422:
 *         description: request validation error
 *       400:
 *         description: missing search criteria, use title, year or genre
 */
router.get("/search", searchUtils);

/**
 * @swagger
 * /imdb:
 *   get:
 *     summary: Queries IMDb api to search movies by criteria
 *     tags: [movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: criteria
 *         schema:
 *           type: string
 *         required: false
 *         description: The search criteria
 *         example: Inception 2017
 *     responses:
 *       200:
 *         description: Movies list
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: missing search criteria
 */
router.get("/imdb", protect, findImdbMoviesBy);

module.exports = router;
