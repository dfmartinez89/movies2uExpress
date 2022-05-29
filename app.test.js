const request = require("supertest");
const app = require("./app");

describe("Movies API", () => {
  it("GET /movies", () => {});
  it("POST /movies", () => {});
  it("GET /movies/{movieid}", () => {});
  it("PUT /movies/{movieid}", () => {});
  it("DEL /movies/{movieid}", () => {});
  it("GET /movies/search?title", () => {});
  it("GET /movies/search?year", () => {});
  it("GET /movies/search?genre", () => {});
  it("GET /movies/{movieid}/comments", () => {});
  it("POST /movies/{movieid}/comments", () => {});
  it("GET /movies/{movieid}/comments/{commentid}", () => {});
  it("PUT /movies/{movieid}/comments/{commentid}", () => {});
  it("DEL /movies/{movieid}/comments/{commentid}", () => {});
});
