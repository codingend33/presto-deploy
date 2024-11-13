import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import LoginForm from "../components/LoginForm";
import { BrowserRouter } from "react-router-dom";
import apiCall from "../api";

vi.mock("../api", () => ({
  default: vi.fn(),
}));

describe("LoginForm Component", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("displays error message on login failure", async () => {
    apiCall.mockRejectedValue(new Error("Login failed"));

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "example@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrong-password" } });
    fireEvent.click(submitButton);

    expect(await screen.findByText("Login failed")).toBeInTheDocument();
  });

  it("renders email, password fields and login button", () => {
    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Login/i })).toBeInTheDocument();
  });

  it("submits login form successfully", async () => {
    apiCall.mockResolvedValue({ token: "test-token" });

    render(
      <BrowserRouter>
        <LoginForm />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole("button", { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: "example@email.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });
    fireEvent.click(submitButton);

    expect(apiCall).toHaveBeenCalledWith("/admin/auth/login", "POST", {
      email: "example@email.com",
      password: "password",
    });
  });
});
