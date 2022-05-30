const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");

describe("Movies API", () => {
  afterAll(() => mongoose.disconnect());

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

  it("POST /movies --> create new movie", () => {
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

  xit("GET /movies/{movieid} --> get movie by id", () => {
    return request(app)
      .get("/movies/1")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expec(response.body).toEqual(
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

  xit("POST /movies --> 422 invalid request body", () => {
    return request(app)
      .post("/movies")
      .send({
        title: "Coconuts",
        year: "2022",
        genre: "Sci-FI",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
        rating: 5,
      })
      .expect("Content-Type", /json/)
      .expect(422);
  });

  xit("GET /movies/{movieid} --> get movie by id", () => {
    return request(app)
      .get("/movies/1")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expec(response.body).toEqual(
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

  xit("GET /movies/{movieid} --> 404 if not found", () => {
    return request(app).get("/movies/9999").expect(404);
  });

  xit("PUT /movies/{movieid} --> update a movie", () => {
    return request(app)
      .put("/movies/1")
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

  xit("DEL /movies/{movieid} --> delete a movie", () => {
    return request(app).del("/movies/1").expect(204);
  });

  xit("GET /movies/search?title --> search movie by title", () => {
    request(app)
      .get("movies/search?title=Corba")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContainnig([
            expect.objectContaining({
              title: "Corba",
              year: expect.any(Number),
              genre: expect.any(String),
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  xit("GET /movies/search?year --> search movie by year", () => {
    request(app)
      .get("movies/search?year=2019")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContainnig([
            expect.objectContaining({
              title: expect.any(String),
              year: 2018,
              genre: expect.any(String),
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  xit("GET /movies/search?genre --> search movie by genre", () => {
    request(app)
      .get("movies/search?genre=comedy")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContainnig([
            expect.objectContaining({
              title: expect.any(String),
              year: expect.any(Number),
              genre: "comedy",
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  xit("GET /movies/{movieid}/comments --> list all comments related to a movie", () => {});

  xit("POST /movies/{movieid}/comments --> create new comment", () => {});

  xit("GET /movies/{movieid}/comments/{commentid} --> get comment by id", () => {});

  xit("PUT /movies/{movieid}/comments/{commentid} --> update comment", () => {});

  xit("DEL /movies/{movieid}/comments/{commentid} --> delete comment", () => {});
});
