describe("Admin Happy Path", () => {
  before(() => {
    cy.visit("http://localhost:3000/register");
  });
  it("Registers successfully", () => {
    // Register as an admin
    cy.get("[id=email]").type("admin9@example.com");
    cy.get("[id=name]").type("Admin");
    cy.get("[id=password]").type("password123");
    cy.get("[id=confirm-password]").type("password123");
    cy.get("button[type=submit]").click();
    // Verify navigation to dashboard
    cy.url({ timeout: 10000 }).should("include", "dashboard");
  });
});
