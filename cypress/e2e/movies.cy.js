describe("Home spec", () => {
  it("should return the list of all the movies", () => {
    cy.request("GET", "/movies").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.contain("application/json");
    });
  });
});
