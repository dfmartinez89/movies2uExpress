const request = require("supertest");
const app = require("./app");

describe("Movies API", () => {

  it("should hit homepage", () => {
    return request(app)
      .get("/")
      .expect("Content-Type", /text\/html; charset=UTF-8/)
      .expect(200);
  });

});
