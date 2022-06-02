const request = require("supertest");
const app = require("../app");

/* TODO: MOCK DATABASE */

describe("Reviews Controller tests", () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  xit("POST /movies/:movieid/reviews --> create new review", () => {});

  it("POST /movies/:movieid/reviews --> 400 invalid request body", () => {
    return request(app)
      .post("/movies/6297dd22643bb66497e0fbe7/reviews")
      .send({
        rating: 1.9,
        description: "Awful movie",
        reviewLocation: "Altamira 42, Almeria, Andalucia, ES",
      })
      .expect("Content-Type", /json/)
      .expect(406)
      .then((response) => {
        expect(response.body).toEqual(
          "Movie validation failed: reviews.2.author: Path `author` is required."
        );
      });
  });

  it("GET /movies/:movieid/reviews/:reviewid --> get review by id", () => {
    return request(app)
      .get("/movies/6297dd22643bb66497e0fbe7/reviews/62987a3b9faf3b5de5b8c837")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.review._id).toBe("62987a3b9faf3b5de5b8c837");
      });
  });

  it("GET /movies/:movieid/reviews/:reviewid --> 404 not found", () => {
    return request(app)
      .get("/movies/6297dd22643bb66497e0fbe7/reviews/62987a3b9faf3b5de5t8c837")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ message: "review not found" });
      });
  });

  it("PUT /movies/:movieid/reviews/:reviewid --> 400 invalid request body", () => {
    return request(app)
      .put("/movies/629871332ca933ea1acafb70/reviews/629874a0f2577a1c8a326059")
      .send({
        rating: "4.3",
        description:
          "Not the greatest Terminator movie, but still a treat indeed",
        reviewLocation: "Anfield, Anfield Road, Liverpool, UK",
      })
      .expect("Content-Type", /json/)
      .expect(400);
  });

  xit("DEL /movies/:movieid/reviews/:reviewid --> delete review", () => {});
});
