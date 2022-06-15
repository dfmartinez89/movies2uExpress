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
      .post("/movies/6299c228bd68f47512f96087/reviews")
      .send({
        author: 'Paco',
        rating: 1.9,
        description: "Awful movie",
      
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toContain(
          "reviewLocation is required"
        );
      });
  });

  it("POST /movies/:movieid/reviews --> 400 reviewLocation is required", () => {
    return request(app)
      .post("/movies/6299c228bd68f47512f96087/reviews")
      .send({
        author: "Visitante",
        rating: 1.9,
        description: "Awful movie",
      })
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({
          message: "reviewLocation is required",
        });
      });
  });

  it("GET /movies/:movieid/reviews/:reviewid --> get review by id", () => {
    return request(app)
      .get("/movies/62a3db726632beaf2869c0fc/reviews/62a47845e3a473f037927952")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.review._id).toBe("62a47845e3a473f037927952");
      });
  });

  it("GET /movies/:movieid/reviews/:reviewid --> 404 review not found", () => {
    return request(app)
      .get("/movies/62a3df660bb03a2ceb19f787/reviews/6298c12851c6e3ace7e78fd1")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ message: "No reviews found" });
      });
  });

  it("GET /movies/:movieid/reviews/:reviewid --> 404 movie not found", () => {
    return request(app)
      .get("/movies/6299c228ba68f47512f96087/reviews/6298c12851c6e3ace7e78fd1")
      .expect("Content-Type", /json/)
      .expect(404)
      .then((response) => {
        expect(response.body).toEqual({ message: "movie not found" });
      });
  });

  it("PUT /movies/:movieid/reviews/:reviewid --> 400 invalid request body", () => {
    return request(app)
      .put("/movies/6299c228bd68f47512f96087/reviews/6299c250bd68f47512f9608a")
      .send({
        rating: "4.3",
        description:
          "Not the greatest Terminator movie, but still a treat indeed",
        reviewLocation: "Anfield, Anfield Road, Liverpool, UK",
      })
      .expect("Content-Type", /json/)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toEqual(
          "Not authorized, token is required"
        );
      });
  });

  xit("DEL /movies/:movieid/reviews/:reviewid --> delete review", () => {});
});
