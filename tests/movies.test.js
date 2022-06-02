const request = require("supertest");
const app = require("../app");

/* TODO: MOCK DATABASE */

describe("Movies Controller tests", () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  it("GET /movies --> list all movies", () => {
    return request(app)
      .get("/movies")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.count).toBeGreaterThan(1);
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
      .expect(200);
  });

  it("POST /movies --> 400 invalid request body", () => {
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
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({"message": "location is required"});
      });
  });

  it("GET /movies/:movieid --> 404 if not found", () => {
    return request(app).get("/movies/9999").expect(404);
  });

  it("PUT /movies/:movieid --> 400 invalid request body", () => {
    return request(app)
      .put("/movies/629525b0b3da7e584584237c")
      .send({
        year: 2022,
        genre: "Sci-FI",
        poster:
          "https://m.media-amazon.com/images/M/MV5BYjQ5NjM0Y2YtNjZkNC00ZDhkLWJjMWItN2QyNzFkMDE3ZjAxXkEyXkFqcGdeQXVyODIxMzk5NjA@._V1_SX300.jpg",
        rating: 5,
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({"message": "location is required"});
      });
  });

  it("DEL /movies/:movieid --> delete a movie not found error", () => {
    return request(app).del("/movies/hola").expect(404);
  });
});
