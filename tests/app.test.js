const request = require("supertest");
const app = require("../app");
const dotenv = require("dotenv");
dotenv.config();

describe("Movies API", () => {

  it("should hit homepage", () => {
    return request(app)
      .get("/")
      .expect("Content-Type", /text\/html; charset=UTF-8/)
      .expect(200);
  });

});
