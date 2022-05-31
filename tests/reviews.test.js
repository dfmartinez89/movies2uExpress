const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");

/* TODO: MOCK DATABASE */

describe("Reviews Controller tests", () => {
  afterAll(() => mongoose.disconnect());

  xit("POST /movies/:movieid/reviews --> create new review", () => {});

  it("GET /movies/:movieid/reviews/:reviewid --> get review by id", () => {
    return request(app)
      .get("/movies/629525b0b3da7e584584237c/reviews/62962a4bd095d95d1ba53838")
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
            _id: "62962a4bd095d95d1ba53838",
            createdOn: "2022-05-31T14:46:35.576Z",
          },
        });
      });
  });

  xit("PUT /movies/:movieid/reviews/:reviewid --> update review", () => {});

  xit("DEL /movies/:movieid/reviews/:reviewid --> delete review", () => {});
});
