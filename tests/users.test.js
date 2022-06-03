const request = require("supertest");
const app = require("../app");

/* TODO: MOCK DATABASE */

describe("Users Controller tests", () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  //need to retrieve token from session
  xit("GET /user --> get data from current logged user", () => {
    return request(app)
      .get("/users/6299dc60a98ce5d8dda1e149")
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({ message: "User data" });
      });
  });

  xit("POST /user --> register new user", () => {
    const user = {
      name: "Corba",
      email: "corba@user.test",
      password: "Corba123",
    };
    return request(app)
      .post("/users")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(201)
      .then((response) => {
        expect(response.body.message).toEqual("Register User");
      });
  });

  it("POST /user --> 400 if missing fields", () => {
    const user = {
      name: "Corba",
      email: "corba@user.test",
    };
    return request(app)
      .post("/users")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual("Please add all required fields");
      });
  });

  it("POST /user --> 400 if user duplicated", () => {
    const user = {
      name: "Corba",
      email: "corba@user.test",
      password: "Corba123",
    };
    return request(app)
      .post("/users")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(400)
      .then((response) => {
        expect(response.body.message).toEqual("User already exists");
      });
  });

  it("POST /user/login --> 403 if wrong creddentials", () => {
    const user = {
      name: "Corba",
      email: "corba@user.test",
      password: "CorBa123",
    };
    return request(app)
      .post("/users/login")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(403)
      .then((response) => {
        expect(response.body.message).toEqual("Invalid credentials");
      });
  });

  it("POST /user/login --> 200 login user", () => {
    const user = {
      name: "Corba",
      email: "corba@user.test",
      password: "Corba123",
    };
    return request(app)
      .post("/users/login")
      .send(user)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((response) => {
        expect(response.body.email).toEqual("corba@user.test");
      });
  });
});
