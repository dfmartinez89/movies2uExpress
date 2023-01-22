describe("Home Test", () => {
  it("should reach home page view", () => {
    cy.visit("/");
    cy.get("h1").should("contain", "Movies2uExpress");
    cy.get("p").should("contain", "Welcome to your movies Backend");
  });
  it("should reach home page resource", () => {
    cy.request("/").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.contain("text/html");
    });
  });
});
