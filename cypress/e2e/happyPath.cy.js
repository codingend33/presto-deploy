describe("Admin Happy Path", () => {
  it("register", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("[id=email]").type("test112322@example.com");
    cy.get("[id=name]").type("Admin");
    cy.get("[id=password]").type("password123");
    cy.get("[id=confirm-password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url({ timeout: 10000 }).should("include", "dashboard");
  });

  it("new presentation", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("[id=email]").type("test112322@example.com");
    cy.get("[id=password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "dashboard");

    cy.get("#new-presentation-button", { timeout: 10000 })
      .should("be.visible")
      .click();
    cy.get("#presentation-title-input").type("New Test Presentation");
    cy.get("#presentation-description-input").type(
      "This is a New presentation"
    );
    cy.get("#presentation-thumbnail-URL").type(
      "https://test.com/thumbnail.jpg"
    );
    cy.get("#presentation-submit-button")
      .should("be.visible")
      .click()
      .then(() => {
        cy.contains("Create New Presentation").should("not.exist");
      });
  });

  it("Updates the thumbnail and title", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("[id=email]").type("test112322@example.com");
    cy.get("[id=password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "dashboard");
    cy.contains("New Test Presentation", { timeout: 10000 }).click();

    cy.url({ timeout: 10000 }).should("include", "/presentations");

    cy.contains("Edit Title & Thumbnail", { timeout: 5000 }).click();

    cy.get("#presentation-title-input")
      .clear()
      .type("Updated Test Presentation");
    cy.get("#thumbnail-url-input")
      .clear()
      .type("https://test.com/new-thumbnail.jpg");

    cy.get("#save-title-thumbnail-button").click();

    cy.contains("Updated Test Presentation").should("exist");
  });
});
