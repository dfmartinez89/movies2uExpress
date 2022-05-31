const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

/* TODO: MOCK DATABASE */

describe("Movies Controller tests", () => {
  afterAll(async () => await mongoose.disconnect());

  it("GET /movies --> list all movies", () => {
    return request(app)
      .get("/movies")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              _id: expect.any(String),
              title: expect.any(String),
              year: expect.any(Number),
              genre: expect.any(String),
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  xit("POST /movies --> create new movie", () => {
    return request(app)
      .post("/movies")
      .send({
        title: "Coconuts",
        year: 2022,
        genre: "Sci-FI",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
        rating: 5,
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            title: "Coconuts",
            year: 2022,
            genre: "Sci-FI",
            poster:
              "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
            rating: 5,
          })
        );
      });
  });

  it("GET /movies/:movieid --> get movie by id", () => {
    return request(app)
      .get("/movies/629525b0b3da7e584584237c")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            title: expect.any(String),
            year: expect.any(Number),
            genre: expect.any(String),
            poster: expect.any(String),
            rating: expect.any(Number),
          })
        );
      });
  });

  it("POST /movies --> 422 invalid request body", () => {
    return request(app)
      .post("/movies")
      .send({
        year: "2022",
        genre: "Sci-FI",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
        rating: 5,
      })
      .expect("Content-Type", /json/)
      .expect(422)
      .then((response) => {
        expect(response.body).toEqual({
          message: "invalid movie data",
        });
      });
  });

  it("GET /movies/:movieid --> 404 if not found", () => {
    return request(app).get("/movies/9999").expect(404);
  });

  xit("PUT /movies/:movieid --> update a movie", () => {
    return request(app)
      .put("/movies/629525b0b3da7e584584237c")
      .send({
        title: "Coconuts",
        year: 2022,
        genre: "Sci-FI",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
        rating: 5,
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            title: "Coconuts",
            year: 2022,
            genre: "Sci-FI",
            poster:
              "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
            rating: 5,
          })
        );
      });
  });

  xit("DEL /movies/:movieid --> delete a movie", () => {
    return request(app).del("/movies/6294c5172d4019708e4b1201").expect(204);
  });
});
