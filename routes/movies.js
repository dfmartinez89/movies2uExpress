const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const {
  moviesFindAll,
  moviesCreate,
  moviesReadOne,
  moviesUpdateOne,
  moviesDeleteOne,
} = require("../controllers/movies");
const {
  reviewsCreate,
  reviewsReadOne,
  reviewsUpdateOne,
  reviewsDeleteOne,
} = require("../controllers/reviews");

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
 *         description: Not authorized, token is required 
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

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Returns the list of all the movies
 *     tags: [movies]
 *     responses:
 *       200:
 *         description: The list of all movies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       500:
 *         description: Server error
 */
router.get("/", moviesFindAll);

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Creates a new movie in db
 *     tags: [movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Movie created succesfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: location is required
 *       406:
 *         description: request body validation
 */
router.post("/", protect, moviesCreate);

/**
 * @swagger
 * /movies/{movieid}:
 *   get:
 *     summary: Finds a movie by id
 *     tags: [movies]
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *     responses:
 *       200:
 *         description: The movie details
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: movie not found
 *       406:
 *         description: request body validation
 */
router.get("/:movieid", moviesReadOne);

/**
 * @swagger
 * /movies/{movieid}:
 *   put:
 *     summary: Updates a movie
 *     tags: [movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       200:
 *         description: The updated movie details
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: movie not found
 */
router.put("/:movieid", protect, moviesUpdateOne);

/**
 * @swagger
 * /movies/{movieid}:
 *   delete:
 *     summary: Deletes a movie
 *     tags: [movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *     responses:
 *       204:
 *         description: Confirms id of movie deleted
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: movie not found
 */
router.delete("/:movieid", protect, moviesDeleteOne);

/**
 * @swagger
 * /movies/{movieid}/reviews:
 *   post:
 *     summary: Creates a new review for the given movie
 *     tags: [reviews]
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         description: Review created succesfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: request body validation
 */
router.post("/:movieid/reviews", reviewsCreate);

/**
 * @swagger
 * /movies/{movieid}/reviews/{reviewid}:
 *   get:
 *     summary: Finds a review by id
 *     tags: [reviews]
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *       - in: path
 *         name: reviewid
 *         schema:
 *           type: string
 *         required: true
 *         description: The review id
 *     responses:
 *       201:
 *         description: Review created succesfully
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: review or movie not found
 *       406:
 *         description: request body validation
 */
router.get("/:movieid/reviews/:reviewid", reviewsReadOne);

/**
 * @swagger
 * /movies/{movieid}/reviews/{reviewid}:
 *   put:
 *     summary: Updates a review by id
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *       - in: path
 *         name: reviewid
 *         schema:
 *           type: string
 *         required: true
 *         description: The review id
 *     responses:
 *       200:
 *         description: The review details
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       404:
 *         description: review or movie not found
 *       406:
 *         description: request body validation
 */
router.put("/:movieid/reviews/:reviewid", protect, reviewsUpdateOne);

/**
 * @swagger
 * /movies/{movieid}/reviews/{reviewid}:
 *   delete:
 *     summary: Deletes a review
 *     tags: [reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: movieid
 *         schema:
 *           type: string
 *         required: true
 *         description: The movie id
 *       - in: path
 *         name: reviewid
 *         schema:
 *           type: string
 *         required: true
 *         description: The review id
 *     responses:
 *       204:
 *         description: Confirms id of review deleted
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       404:
 *         description: review not found
 */
router.delete("/:movieid/reviews/:reviewid", protect, reviewsDeleteOne);

module.exports = router;
