const request = require("supertest");
const app = require("./app");
const mongoose = require("mongoose");

describe("Movies API", () => {
  afterAll(() => mongoose.disconnect());

  it("should hit homepage", () => {
    return request(app)
      .get("/")
      .expect("Content-Type", /text\/html; charset=UTF-8/)
      .expect(200);
  });

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
      .expect(422);
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

  it("GET /movies/search?title --> search movie by title", () => {
    return request(app)
      .get("/search?title=Terminator%20Genisys")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: "Terminator Genisys",
              year: expect.any(Number),
              genre: expect.any(String),
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  it("GET /movies/search?title --> 404 if not found", () => {
    return request(app)
      .get("/search?title=Corba")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "there are no movies with title Corba",
          })
        );
      });
  });

  it("GET /search?year --> search movie by year", () => {
    return request(app)
      .get("/search?year=2015")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              year: 2015,
              genre: expect.any(String),
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  it("GET /search?year --> 404 if not found", () => {
    return request(app)
      .get("/search?year=2023")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "there are no movies on year 2023",
          })
        );
      });
  });

  it("GET /search?genre --> search movie by genre", () => {
    return request(app)
      .get("/search?genre=Action,%20Adventure,%20Sci-Fi")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              year: expect.any(Number),
              genre: "Action, Adventure, Sci-Fi",
              poster: expect.any(String),
              rating: expect.any(Number),
            }),
          ])
        );
      });
  });

  it("GET /search?genre --> 404 if not found", () => {
    return request(app)
      .get("/search?genre=Adult")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "there are no movies with genre Adult",
          })
        );
      });
  });

  it("GET /movies/:movieid/reviews --> list all reviews related to a movie", () => {
    return request(app)
      .get("/movies/629525b0b3da7e584584237c/reviews")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          movie: {
            id: "629525b0b3da7e584584237c",
            title: "Terminator Genisys",
          },
          reviews: [
            {
              _id: "6295459c84a2fe1c55733e7b",
              author: "Taquito",
              createdOn: "2022-05-30T22:30:52.790Z",
              description:
                "Not the greatest Terminator movie, but still a treat indeed",
              rating: 4.3,
            },
          ],
        });
      });
  });

  xit("POST /movies/:movieid/reviews --> create new comment", () => {});

  it("GET /movies/:movieid/reviews/:reviewid --> get comment by id", () => {
    return request(app)
      .get("/movies/629525b0b3da7e584584237c/reviews/6295459c84a2fe1c55733e7b")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({
          movie: {
            title: "Terminator Genisys",
          },
          review: {
            author: "Taquito",
            rating: 4.3,
            description:
              "Not the greatest Terminator movie, but still a treat indeed",
            _id: "6295459c84a2fe1c55733e7b",
            createdOn: "2022-05-30T22:30:52.790Z",
          },
        });
      });
  });

  xit("PUT /movies/:movieid/reviews/:reviewid --> update comment", () => {});

  xit("DEL /movies/:movieid/reviews/:reviewid --> delete comment", () => {});
});
