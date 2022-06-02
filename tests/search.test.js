const request = require("supertest");
const app = require("../app");

/* TODO: MOCK DATABASE */

describe("Search Controller tests", () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  it("GET /movies/search?title --> search movie by title", () => {
    return request(app)
      .get("/search?title=Transformers: The Last Knight")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: "Transformers: The Last Knight",
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
      .get("/search?year=2017")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              title: expect.any(String),
              year: 2017,
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
      .get("/search?genre=Action, Adventure, Sci-Fi")
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

  it("GET /search? --> 400 not found search criteria", () => {
    return request(app)
      .get("/search?genr")
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual(
          expect.objectContaining({
            message: "missing search criteria, use title, year or genre",
          })
        );
      });
  });
});
